export const normalizeIsoTimestamp = (input?: string): string => {
  if (!input) {
    return new Date().toISOString();
  }

  const parsedMs = Date.parse(input);
  if (Number.isNaN(parsedMs)) {
    return new Date().toISOString();
  }

  return new Date(parsedMs).toISOString();
};
