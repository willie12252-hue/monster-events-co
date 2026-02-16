// Tiny chart helpers for Admin analytics (no external deps)

export function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function rangeDays(end: Date, days: number) {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(formatDate(addDays(end, -i)));
  return out;
}

export function toMonthKey(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}
