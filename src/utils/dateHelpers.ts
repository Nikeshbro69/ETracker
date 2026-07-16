export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfMonth(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  );
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function startOfYear(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

export function endOfYear(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), 11, 31));
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function isFutureDate(date: Date, toleranceDays = 1): boolean {
  const now = new Date();
  const tolerance = new Date(now);
  tolerance.setDate(now.getDate() + toleranceDays);
  return date > tolerance;
}

export function parseDate(str: string): Date {
  const d = new Date(str);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${str}`);
  return d;
}
