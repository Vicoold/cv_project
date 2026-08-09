const SUPPORTED_LOCALES = ['en', 'pl', 'de', 'es', 'ar'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = 'en';
const requestedLocale = process.env.TEST_LOCALE ?? DEFAULT_LOCALE;

if (!SUPPORTED_LOCALES.includes(requestedLocale as SupportedLocale)) {
  throw new Error(
    `Unsupported TEST_LOCALE "${requestedLocale}". Supported locales: ${SUPPORTED_LOCALES.join(', ')}.`,
  );
}

export const TEST_LOCALE = requestedLocale as SupportedLocale;

const localePattern = /^\/(?:en|pl|de|es|ar)(?:\/|$)/;

export const localePath = (path: string = '/'): string => {
  if (path.startsWith('http')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized === '/') {
    return `/${TEST_LOCALE}`;
  }

  if (localePattern.test(normalized)) {
    return normalized;
  }

  const result = `/${TEST_LOCALE}${normalized}`;
  return result.endsWith('/') && result.length > 3 ? result.slice(0, -1) : result;
};
