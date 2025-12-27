export const TEST_MODE: boolean =
  typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_TEST_MODE === 'true';

export const ANALYSIS_URL: string =
  (typeof process !== 'undefined' && process.env && (process.env.EXPO_PUBLIC_ANALYSIS_URL as string)) || '';

export const REQUEST_TIMEOUT_MS = 15000;


