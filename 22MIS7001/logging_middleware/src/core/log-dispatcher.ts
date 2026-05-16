import { HttpLogClient } from '../client/http-log-client.js';
import type { LogPayload } from '../types/log-contract.js';
import { resolveLoggingConfig } from '../utils/env.js';

const sharedLogClient = new HttpLogClient(resolveLoggingConfig());

export const dispatchLog = async (payload: LogPayload): Promise<void> => {
  await sharedLogClient.send(payload);
};
