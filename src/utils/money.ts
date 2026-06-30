import { useTranslation } from 'react-i18next';
import type { AppLocale } from '@/config/locale.config';
import { DEFAULT_CURRENCY, INTL_LOCALE, toAppLocale } from '@/config/locale.config';

/** Seul point de formatage prix de l'app. Jamais de '€'/'EUR' littéral ailleurs. */
export function formatMoney(amount: number, currency = DEFAULT_CURRENCY, locale: AppLocale = 'fr'): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'TND' ? 3 : 2,
  }).format(amount);
}

/** Lié à la langue active i18next — évite de repasser `locale` à chaque appel dans les composants. */
export function useMoneyFormatter() {
  const { i18n } = useTranslation();
  const locale = toAppLocale(i18n.language);
  return (amount: number, currency = DEFAULT_CURRENCY) => formatMoney(amount, currency, locale);
}
