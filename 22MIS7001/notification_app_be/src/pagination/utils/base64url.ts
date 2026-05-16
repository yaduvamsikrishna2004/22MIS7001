export const encodeBase64Url = (rawValue: string): string => {
  return Buffer.from(rawValue, 'utf-8').toString('base64url');
};

export const decodeBase64Url = (encodedValue: string): string => {
  return Buffer.from(encodedValue, 'base64url').toString('utf-8');
};
