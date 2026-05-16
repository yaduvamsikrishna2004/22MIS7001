import type { LogPayload } from '../types/log-contract.js';

const MAX_MESSAGE_LENGTH = 500;

const sanitizeMessage = (message: string): string => {
  const normalized = message.trim();
  if (normalized.length <= MAX_MESSAGE_LENGTH) {
    return normalized;
  }

  return normalized.slice(0, MAX_MESSAGE_LENGTH);
};

export const validatePayload = (payload: LogPayload): LogPayload | null => {
  if (!payload.message || payload.message.trim().length === 0) {
    return null;
  }

  return {
    ...payload,
    message: sanitizeMessage(payload.message)
  };
};
