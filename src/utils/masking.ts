/**
 * Masking utilities for customer privacy (KVKK / GDPR compliant).
 * 
 * Rules:
 * - Names: "Ahmet Yılmaz" -> "A*** Y***"
 * - Phones: "0507 754 74 84" / "05555551234" -> "0507754****" / "0555555****"
 */

export function maskCustomerName(name?: string): string {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'M***';
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M***';

  return parts
    .map((part) => {
      const firstChar = part.charAt(0).toLocaleUpperCase('tr-TR');
      return `${firstChar}***`;
    })
    .join(' ');
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return '0555555****';
  }

  // Extract raw digits
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('90') && digits.length === 12) {
    digits = '0' + digits.slice(2);
  } else if (!digits.startsWith('0') && digits.length === 10) {
    digits = '0' + digits;
  }

  if (digits.length >= 7) {
    const prefix = digits.slice(0, digits.length - 4);
    return `${prefix}****`;
  }

  return '0555555****';
}
