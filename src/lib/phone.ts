export const PHONE_LENGTH = 10;

/** Keeps digits only and limits the value to 10 digits (used while typing). */
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
}

/**
 * Converts a stored number (e.g. "+94 77 123 4567") into the 10-digit local
 * format (0771234567) so it fits the input.
 */
export function normalizeStoredPhone(value?: string): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("94")) return `0${digits.slice(2)}`;
  if (digits.length === 9) return `0${digits}`;
  return digits.slice(0, PHONE_LENGTH);
}

export function isValidPhone(value: string): boolean {
  return new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(value);
}

export const PHONE_ERROR = "Phone number must be exactly 10 digits.";
