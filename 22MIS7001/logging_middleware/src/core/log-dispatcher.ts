import { HttpLogClient } from '../client/http-log-client.js';
import type { DispatchOutcome, LogPayload } from '../types/log-contract.js';
import { validatePayload } from '../utils/payload-validator.js';
import { resolveLoggingConfig } from '../utils/env.js';

const sharedLogClient = new HttpLogClient(resolveLoggingConfig());
const fallbackQueue: LogPayload[] = [];
const MAX_FALLBACK_QUEUE_SIZE = 100;

const enqueueFallback = (payload: LogPayload): void => {
  fallbackQueue.push(payload);
  if (fallbackQueue.length > MAX_FALLBACK_QUEUE_SIZE) {
    fallbackQueue.shift();
  }
};

export const dispatchLog = async (payload: LogPayload): Promise<DispatchOutcome> => {
  const validatedPayload = validatePayload(payload);
  if (!validatedPayload) {
    return {
      accepted: false,
      failure: {
        errorCode: 'INVALID_PAYLOAD',
        errorMessage: 'missing message in payload',
        retryable: false,
        attempt: 0
      }
    };
  }

  const outcome = await sharedLogClient.send(validatedPayload);
  if (!outcome.accepted) {
    enqueueFallback(validatedPayload);
  }

  return outcome;
};
