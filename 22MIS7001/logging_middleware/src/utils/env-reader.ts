const toSafeInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const readNodeEnv = (key: string): string | undefined => {
  if (typeof process === 'undefined' || !process.env) {
    return undefined;
  }

  return process.env[key];
};

export const readEnv = (key: string): string | undefined => {
  const value = readNodeEnv(key)?.trim();
  return value && value.length > 0 ? value : undefined;
};

export const readIntegerEnv = (key: string, fallback: number): number => {
  return toSafeInteger(readEnv(key), fallback);
};
