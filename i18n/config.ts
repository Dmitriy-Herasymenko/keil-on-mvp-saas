export type Locale = 'en' | 'de' | 'uk';

export const locales: Locale[] = ['en', 'de', 'uk'];
export const defaultLocale: Locale = 'uk';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  uk: 'Українська',
};
