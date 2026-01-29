export function digitsOnly(value: string, maxLen?: number) {
  const v = (value || '').replace(/\D/g, '');
  return typeof maxLen === 'number' ? v.slice(0, maxLen) : v;
}

export function isLikelyEmail(value: string) {
  const v = (value || '').trim();
  // pragmatic email check (UI-level). backend is source of truth.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function nonEmpty(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : value != null;
}

export function clampNumber(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
