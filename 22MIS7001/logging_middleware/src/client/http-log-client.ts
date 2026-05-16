import axios, { AxiosError, type AxiosInstance } from 'axios';

import type {
  DispatchOutcome,
  LogErrorMetadata,
  LogPayload,
  LoggingRuntimeConfig
} from '../types/log-contract.js';
import { buildAuthHeaders } from './auth-headers.js';

interface TokenEnvelope {
  token: string;
  expiresInSeconds: number;
}

export class HttpLogClient {
  private readonly httpClient: AxiosInstance;
  private authToken: string | null = null;
  private tokenExpiryEpochMs = 0;

  public constructor(private readonly config: LoggingRuntimeConfig) {
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  public async send(payload: LogPayload): Promise<DispatchOutcome> {
    const token = await this.getToken();

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        await this.httpClient.post('/logs', payload, {
          headers: buildAuthHeaders(token)
        });

        return { accepted: true };
      } catch (error) {
        const metadata = this.toErrorMetadata(error, attempt);
        if (!metadata.retryable || attempt === this.config.maxRetries) {
          return {
            accepted: false,
            failure: metadata
          };
        }

        await this.waitBeforeRetry(attempt);
      }
    }

    return {
      accepted: false,
      failure: {
        errorCode: 'UNKNOWN_SEND_FAILURE',
        errorMessage: 'dispatch exhausted without explicit error context',
        retryable: false,
        attempt: this.config.maxRetries
      }
    };
  }

  private async getToken(): Promise<string | null> {
    if (!this.config.authEndpoint || !this.config.clientId || !this.config.clientSecret) {
      return null;
    }

    const now = Date.now();
    if (this.authToken && now < this.tokenExpiryEpochMs) {
      return this.authToken;
    }

    try {
      const response = await this.httpClient.post<TokenEnvelope>(this.config.authEndpoint, {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret
      });

      const expiresInSeconds = Math.max(30, response.data.expiresInSeconds);
      this.authToken = response.data.token;
      this.tokenExpiryEpochMs = now + (expiresInSeconds - 30) * 1000;

      return this.authToken;
    } catch {
      this.authToken = null;
      this.tokenExpiryEpochMs = 0;
      return null;
    }
  }

  private toErrorMetadata(error: unknown, attempt: number): LogErrorMetadata {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;
      const retryable = statusCode ? statusCode >= 500 || statusCode === 429 : true;

      return {
        errorCode: axiosError.code || 'AXIOS_ERROR',
        statusCode,
        errorMessage: axiosError.message,
        retryable,
        attempt
      };
    }

    return {
      errorCode: 'UNKNOWN_ERROR',
      errorMessage: error instanceof Error ? error.message : 'unknown error value',
      retryable: true,
      attempt
    };
  }

  private async waitBeforeRetry(attempt: number): Promise<void> {
    const delayMs = this.config.retryDelayMs * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
