import { promises as fs } from 'node:fs';
import path from 'node:path';

import { acquireEvaluationAccessToken } from '../integrations/auth/evaluation-auth-client.js';
import { logBackend } from '../integrations/logging/backend-log.js';
import { runtimeConfig } from '../shared/config/runtime-config.js';

interface ScriptArguments {
  email?: string;
  name?: string;
  rollNo?: string;
  writeFrontendEnv: boolean;
}

const parseArguments = (argv: string[]): ScriptArguments => {
  const args: ScriptArguments = {
    writeFrontendEnv: false
  };

  for (const entry of argv) {
    if (entry === '--write-frontend-env') {
      args.writeFrontendEnv = true;
      continue;
    }

    if (entry.startsWith('--email=')) {
      args.email = entry.slice('--email='.length).trim();
      continue;
    }

    if (entry.startsWith('--name=')) {
      args.name = entry.slice('--name='.length).trim();
      continue;
    }

    if (entry.startsWith('--rollNo=')) {
      args.rollNo = entry.slice('--rollNo='.length).trim();
      continue;
    }
  }

  return args;
};

const upsertEnvEntry = (source: string, key: string, value: string): string => {
  const escaped = value.replace(/\\/g, '\\\\');
  const nextLine = `${key}=${escaped}`;
  const matcher = new RegExp(`^${key}=.*$`, 'm');

  if (matcher.test(source)) {
    return source.replace(matcher, nextLine);
  }

  if (!source.trim()) {
    return `${nextLine}\n`;
  }

  const suffix = source.endsWith('\n') ? '' : '\n';
  return `${source}${suffix}${nextLine}\n`;
};

const writeFrontendEnvFile = async (accessToken: string): Promise<string> => {
  const frontendRoot = path.resolve(process.cwd(), '..', 'notification_app_fe');
  const envLocalPath = path.resolve(frontendRoot, '.env.local');
  const notificationApiUrl =
    runtimeConfig.evaluationAuth.frontendNotificationApiUrl ||
    runtimeConfig.evaluationAuth.apiBaseUrl;

  const existing = await fs.readFile(envLocalPath, 'utf8').catch(() => '');
  let nextContent = upsertEnvEntry(existing, 'VITE_API_BEARER_TOKEN', accessToken);
  if (notificationApiUrl) {
    nextContent = upsertEnvEntry(nextContent, 'VITE_NOTIFICATION_API_URL', notificationApiUrl);
  }

  await fs.writeFile(envLocalPath, nextContent, 'utf8');
  return envLocalPath;
};

const main = async (): Promise<void> => {
  const args = parseArguments(process.argv.slice(2));
  const tokenResult = await acquireEvaluationAccessToken({
    email: args.email,
    name: args.name,
    rollNo: args.rollNo
  });

  if (args.writeFrontendEnv) {
    const filePath = await writeFrontendEnvFile(tokenResult.accessToken);
    await logBackend('info', 'auth', 'frontend env file updated with access token', {
      filePath
    });
  }

  await logBackend('info', 'auth', 'evaluation token bootstrap completed successfully');
  process.stdout.write(`${tokenResult.accessToken}\n`);
};

void main().catch(async (error: unknown) => {
  await logBackend('fatal', 'auth', 'evaluation token bootstrap script failed', {
    message: error instanceof Error ? error.message : 'unknown bootstrap script error'
  });

  process.exitCode = 1;
});

