import type { Server } from 'node:http';

import { createApplication } from './application.js';
import { runtimeConfig } from '../shared/config/runtime-config.js';
import { logBackend } from '../integrations/logging/backend-log.js';

const app = createApplication();

let server: Server | null = null;

const startServer = async (): Promise<void> => {
  server = app.listen(runtimeConfig.port);

  await logBackend('info', 'config', 'backend service started', {
    serviceName: runtimeConfig.serviceName,
    nodeEnv: runtimeConfig.nodeEnv,
    port: runtimeConfig.port
  });
};

const shutdownServer = async (signal: NodeJS.Signals): Promise<void> => {
  await logBackend('warn', 'config', 'shutdown signal received', {
    signal,
    serviceName: runtimeConfig.serviceName
  });

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    await logBackend('info', 'config', 'backend service stopped', {
      signal,
      serviceName: runtimeConfig.serviceName
    });

    process.exit(0);
  });

  setTimeout(async () => {
    await logBackend('fatal', 'config', 'forced shutdown after timeout', {
      signal,
      serviceName: runtimeConfig.serviceName
    });
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGINT', () => {
  void shutdownServer('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdownServer('SIGTERM');
});

void startServer().catch(async (error: unknown) => {
  await logBackend('fatal', 'config', 'failed to start backend service', {
    message: error instanceof Error ? error.message : 'unknown startup error'
  });
  process.exit(1);
});
