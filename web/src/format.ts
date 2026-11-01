const dt = new Intl.DateTimeFormat('da-DK', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });
const d = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', timeZone: 'Europe/Copenhagen' });

export const fmtDateTime = (s: string | null) => (s ? dt.format(new Date(s)) : '–');
export const fmtDate = (s: string) => d.format(new Date(s));
