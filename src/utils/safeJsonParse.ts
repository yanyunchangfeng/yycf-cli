export const safeJsonParse = <T extends Record<keyof any, any>>(str: string, defaultValue = {}): T => {
  try {
    return JSON.parse(str || '{}');
  } catch (err) {
    console.error(`JSON parse error: ${err}`);
    return defaultValue as T;
  }
};
