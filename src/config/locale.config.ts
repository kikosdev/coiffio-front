export const DEFAULT_TIMEZONE = 'Africa/Tunis'; // UTC+1, pas de changement d'heure (DST)
export const DEFAULT_CURRENCY = 'TND';
export const DEFAULT_LOCALE = 'fr';
export const SUPPORTED_LOCALES = ['en', 'fr', 'ar'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

// Locale BCP-47 régionalisée (Tunisie) : chiffres latins même en arabe, symbole "DT" correct pour TND.
export const INTL_LOCALE: Record<AppLocale, string> = { en: 'en-TN', fr: 'fr-TN', ar: 'ar-TN' };

export function toAppLocale(lng: string | undefined): AppLocale {
  const base = lng?.split('-')[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(base ?? '') ? (base as AppLocale) : DEFAULT_LOCALE;
}
