export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function isSameDay(a: string, b: string): boolean {
  return a.split('T')[0] === b.split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  // 0=Sun, returns 0-based. Adjust to Mon-start
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function monthName(month: number): string {
  const names = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];
  return names[month];
}
