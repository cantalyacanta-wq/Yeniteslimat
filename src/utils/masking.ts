/**
 * Mask customer contact details for public views (privacy protection)
 * e.g. "Ahmet Yılmaz" -> "Ah*** Yil***" or "A*** Y***"
 * "0532 123 4567" -> "0532 *** ** 67"
 */
export function maskName(fullName?: string): string {
  if (!fullName || !fullName.trim()) return 'Müşteri (Gizli)';
  const parts = fullName.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) {
        return part.charAt(0) + '*';
      }
      return part.charAt(0) + '*'.repeat(Math.min(part.length - 1, 3));
    })
    .join(' ');
}

export function maskPhone(phone?: string): string {
  if (!phone || !phone.trim()) return '05** *** ** **';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 7) return '05** *** ** **';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-2);
  return `${prefix} *** ** ${suffix}`;
}

export function maskAddress(address?: string): string {
  if (!address || !address.trim()) return 'Merkez / Mahalle içi teslimat';
  // Keep first 20-25 characters or district/cadde if short, mask specific flat/apt
  if (address.length <= 15) return address;
  return address.substring(0, 18) + '... (Detay Kuryeye Özel)';
}
