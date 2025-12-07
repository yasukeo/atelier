// Moroccan phone normalization: accepts +2126/7XXXXXXXX or 06/07XXXXXXXX -> returns +2126/7...
export function normalizeMoroccanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (/^0[67]\d{8}$/.test(digits)) return `+212${digits.slice(1)}`
  if (/^212[67]\d{8}$/.test(digits)) return `+${digits}`
  if (/^[+]212[67]\d{8}$/.test(input)) return input
  return null
}

export function isDiscountValid(now: Date, startsAt?: Date | null, endsAt?: Date | null): boolean {
  if (startsAt && now < startsAt) return false
  if (endsAt && now > endsAt) return false
  return true
}
