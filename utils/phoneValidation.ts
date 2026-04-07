export type PhoneErrorKey = 'required' | 'tooShort' | 'tooLong';

/**
 * Basic international-friendly validation: counts digits (ignoring spaces, dashes, +).
 * Invalid results use `errorKey` so the UI can show translated messages.
 */
export function validatePhoneNumber(
  raw: string,
): { valid: true; value: string } | { valid: false; errorKey: PhoneErrorKey } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, errorKey: 'required' };
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 8) {
    return { valid: false, errorKey: 'tooShort' };
  }
  if (digitsOnly.length > 15) {
    return { valid: false, errorKey: 'tooLong' };
  }

  return { valid: true, value: trimmed };
}
