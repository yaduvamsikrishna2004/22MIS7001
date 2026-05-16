import { createApp } from './app.js';
import { runtimeConfig } from '../shared/config/runtime-config.js';
import { logBackend } from '../integrations/logging/backend-log.js';

const app = createApp();

app.listen(runtimeConfig.port, () => {
  void logBackend('info', 'config', 'backend service started', {
    port: runtimeConfig.port,
    nodeEnv: runtimeConfig.nodeEnv,
    serviceName: runtimeConfig.serviceName
  });
});
