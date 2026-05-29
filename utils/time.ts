/**
 * Time-of-day utilities shared across screens that work with "HH:MM" strings
 * (state windows, quiet hours) and native time pickers.
 */

export function hhmmToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

export function dateToHHmm(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Renders an "HH:MM" 24-hour string as a 12-hour display split into the
 * digits and the AM/PM suffix. Useful for chip-style time controls that
 * style the period separately.
 */
export function formatTimeForDisplay(hhmm: string): { time: string; period: string } {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return {
    time: `${hour12}:${(m ?? 0).toString().padStart(2, '0')}`,
    period,
  };
}

/** Single-string variant, e.g. "9:30 PM". */
export function formatTimeForDisplayString(hhmm: string): string {
  const { time, period } = formatTimeForDisplay(hhmm);
  return `${time} ${period}`;
}
