import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { enUS, fr, arTN } from 'date-fns/locale';
import type { AppLocale } from '@/config/locale.config';
import { DEFAULT_TIMEZONE } from '@/config/locale.config';

const LOCALES = { en: enUS, fr, ar: arTN } as const;

/**
 * "Now" dans le fuseau du salon. toZonedTime décale l'epoch en fonction du fuseau *système*
 * pour que les getters LOCAUX (getHours/getMinutes, jamais getUTCHours/getUTCMinutes) lisent
 * l'heure murale de `tz` quel que soit le fuseau du navigateur. À ne pas confondre avec la
 * convention RDV (isoToDecHr dans ScheduleScreen), qui lit elle des getters UTC parce que les
 * timestamps RDV stockent déjà l'heure murale comme des chiffres UTC littéraux.
 */
export function salonNow(tz: string = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(), tz);
}

/** Formate une date UTC/ISO réelle dans le fuseau du salon. JAMAIS toISOString() pour de l'affichage local. */
export function formatSalonTime(
  date: Date | string,
  pattern: string,
  opts?: { tz?: string; locale?: AppLocale },
): string {
  const tz = opts?.tz ?? DEFAULT_TIMEZONE;
  return formatInTimeZone(date, tz, pattern, { locale: LOCALES[opts?.locale ?? 'fr'] });
}

/** Heure décimale courante dans le fuseau du salon (ex. 14.15 pour 14:09) — pour le marqueur NOW de l'Arc of the day. */
export function salonNowDecHr(tz: string = DEFAULT_TIMEZONE): number {
  const [h, m] = formatInTimeZone(new Date(), tz, 'HH:mm').split(':').map(Number);
  return h + m / 60;
}
