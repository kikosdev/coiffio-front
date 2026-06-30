/**
 * Backend availability/booking dates are plain "YYYY-MM-DD" business-day strings (no
 * timezone semantics — see availability.util.ts). `Date#toISOString()` reports the UTC
 * calendar day, which drifts from the user's local calendar day near midnight for any
 * non-zero UTC offset (e.g. silently booking "today" onto yesterday for UTC+1 users).
 * Always build these strings from local Date getters instead.
 */
export function localDateISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
