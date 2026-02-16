export function isValidEmail(v: string) {
  const s = v.trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isValidPhone(v: string) {
  const s = v.trim();
  if (!s) return false;
  return /^[0-9+\-()\s]{6,}$/.test(s);
}
