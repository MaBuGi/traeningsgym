const dt = new Intl.DateTimeFormat('da-DK', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });
const d = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', timeZone: 'Europe/Copenhagen' });

export const fmtDateTime = (s: string | null) => (s ? dt.format(new Date(s)) : '–');
export const fmtDate = (s: string) => d.format(new Date(s));

// Sidste dag i ugen: lukketidspunktet er midnat, så dagen før.
export const fmtLastDay = (closes: string) => d.format(new Date(new Date(closes).getTime() - 1));

export function timeLeft(closes: string): string {
  const ms = new Date(closes).getTime() - Date.now();
  if (ms <= 0) return 'lukket';
  const h = Math.floor(ms / 3600e3);
  if (h >= 48) return `${Math.floor(h / 24)} dage tilbage`;
  if (h >= 1) return `${h} timer tilbage`;
  return `${Math.max(1, Math.floor(ms / 60e3))} min tilbage`;
}
