import 'dotenv/config';

export const loadBackendEnvironment = (): NodeJS.ProcessEnv => {
  return process.env;
};
