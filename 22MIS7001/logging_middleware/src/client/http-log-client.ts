import axios, { type AxiosInstance } from 'axios';

import type { LogPayload, LoggingRuntimeConfig } from '../types/log-contract.js';

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

  public async send(payload: LogPayload): Promise<boolean> {
    const token = await this.getToken();

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        await this.httpClient.post('/logs', payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });

        return true;
      } catch {
        if (attempt === this.config.maxRetries) {
          return false;
        }

        await this.waitBeforeRetry(attempt);
      }
    }

    return false;
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
      const response = await this.httpClient.post<TokenEnvelope>(
        this.config.authEndpoint,
        {
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret
        }
      );

      const expiryBufferMs = 30_000;
      this.authToken = response.data.token;
      this.tokenExpiryEpochMs = now + response.data.expiresInSeconds * 1000 - expiryBufferMs;

      return this.authToken;
    } catch {
      this.authToken = null;
      this.tokenExpiryEpochMs = 0;
      return null;
    }
  }

  private async waitBeforeRetry(attempt: number): Promise<void> {
    const backoffMs = this.config.retryDelayMs * (attempt + 1);
    await new Promise((resolve) => {
      setTimeout(resolve, backoffMs);
    });
  }
}
