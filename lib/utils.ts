import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize Moroccan phone numbers to +212 format (basic heuristic)
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^0-9+]/g, '')
  if (digits.startsWith('00')) digits = '+' + digits.slice(2)
  if (digits.startsWith('+212')) return digits
  if (digits.startsWith('0')) return '+212' + digits.slice(1)
  if (!digits.startsWith('+')) return '+212' + digits
  return digits
}

export function isValidPostalCode(code: string): boolean {
  return code.trim().length > 0 // future: pattern match
}
