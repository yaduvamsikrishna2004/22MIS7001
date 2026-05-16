import { logBackend } from '../logging/backend-log.js';
import { runtimeConfig } from '../../shared/config/runtime-config.js';

interface AuthBootstrapIdentity {
  email: string;
  name: string;
  rollNo: string;
}

interface AuthBootstrapPayload extends AuthBootstrapIdentity {
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

interface AuthResponseShape {
  access_token?: unknown;
  accessToken?: unknown;
  expires_in?: unknown;
  expiresIn?: unknown;
}

export interface AuthBootstrapResult {
  accessToken: string;
  expiresInSeconds: number | null;
}

const readRequiredValue = (value: string | undefined, label: string): string => {
  if (!value || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }

  return value.trim();
};

const resolveIdentity = (
  identity?: Partial<AuthBootstrapIdentity>
): AuthBootstrapIdentity => {
  return {
    email: readRequiredValue(
      identity?.email || runtimeConfig.evaluationAuth.defaultEmail,
      'AUTH_BOOTSTRAP_EMAIL'
    ),
    name: readRequiredValue(
      identity?.name || runtimeConfig.evaluationAuth.defaultName,
      'AUTH_BOOTSTRAP_NAME'
    ),
    rollNo: readRequiredValue(
      identity?.rollNo || runtimeConfig.evaluationAuth.defaultRollNo,
      'AUTH_BOOTSTRAP_ROLL_NO'
    )
  };
};

const buildAuthEndpoint = (): URL => {
  const baseUrl = readRequiredValue(runtimeConfig.evaluationAuth.apiBaseUrl, 'EVALUATION_API_BASE_URL');
  const parsed = new URL(baseUrl);
  const authPath = runtimeConfig.evaluationAuth.authPath.startsWith('/')
    ? runtimeConfig.evaluationAuth.authPath
    : `/${runtimeConfig.evaluationAuth.authPath}`;
  parsed.pathname = authPath;
  parsed.search = '';
  return parsed;
};

const buildPayload = (identity: AuthBootstrapIdentity): AuthBootstrapPayload => {
  return {
    ...identity,
    accessCode: readRequiredValue(runtimeConfig.evaluationAuth.accessCode, 'ACCESS_CODE'),
    clientID: readRequiredValue(runtimeConfig.evaluationAuth.clientId, 'CLIENT_ID'),
    clientSecret: readRequiredValue(runtimeConfig.evaluationAuth.clientSecret, 'CLIENT_SECRET')
  };
};

const parseTokenResponse = (raw: unknown): AuthBootstrapResult => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Auth response is not an object');
  }

  const payload = raw as AuthResponseShape;
  const rawToken = payload.access_token ?? payload.accessToken;
  if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
    throw new Error('Auth response missing access token');
  }

  const rawExpiry = payload.expires_in ?? payload.expiresIn;
  const expiresInSeconds = typeof rawExpiry === 'number' && Number.isFinite(rawExpiry) ? rawExpiry : null;

  return {
    accessToken: rawToken.trim(),
    expiresInSeconds
  };
};

const withTimeout = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
  timeoutHandle.unref();
  return { controller, timeoutHandle };
};

export const acquireEvaluationAccessToken = async (
  identityOverride?: Partial<AuthBootstrapIdentity>
): Promise<AuthBootstrapResult> => {
  const identity = resolveIdentity(identityOverride);
  const endpoint = buildAuthEndpoint();
  const payload = buildPayload(identity);
  const { controller, timeoutHandle } = withTimeout(runtimeConfig.evaluationAuth.timeoutMs);

  await logBackend('info', 'auth', 'starting evaluation auth bootstrap request', {
    endpoint: endpoint.origin + endpoint.pathname
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      await logBackend('error', 'auth', 'evaluation auth bootstrap failed with non-success status', {
        statusCode: response.status
      });
      throw new Error(`Auth API responded with status ${response.status}`);
    }

    const parsed = parseTokenResponse(await response.json());

    await logBackend('info', 'auth', 'evaluation auth bootstrap token acquired', {
      hasExpiry: parsed.expiresInSeconds !== null
    });

    return parsed;
  } catch (error) {
    await logBackend('error', 'auth', 'evaluation auth bootstrap request failed', {
      message: error instanceof Error ? error.message : 'unknown auth bootstrap failure'
    });
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
};

