/**
 * Bangladeshi Mobile Phone Validation & Normalization per FR-ACC-02 & FR-ACC-03
 */

export function normalizePhone(rawPhone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, normalized: '', error: 'Phone number is required' };
  }

  // Remove spaces, hyphens, parentheses, and any non-digit except leading plus
  const cleaned = rawPhone.trim().replace(/[\s\-()]/g, '');

  // Bangladeshi mobile numbers: 11 digits starting with 013-019
  // Or international format +8801[3-9]... or 8801[3-9]...
  const match = cleaned.match(/^(?:\+?88)?(01[3-9]\d{8})$/);

  if (!match) {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid Bangladeshi phone number (e.g. 01712-345678)',
    };
  }

  // Always return normalized with 88 prefix: 8801XXXXXXXXX
  const local11 = match[1];
  const normalized = `88${local11}`;

  return {
    isValid: true,
    normalized,
  };
}

export function isValidBDPhone(rawPhone: string): boolean {
  return normalizePhone(rawPhone).isValid;
}

export function formatPhoneLocal(rawPhone: string): string {
  const { isValid, normalized } = normalizePhone(rawPhone);
  if (!isValid) return rawPhone;
  // Convert 8801712345678 -> 01712-345678
  const local = normalized.slice(2);
  return `${local.slice(0, 5)}-${local.slice(5)}`;
}

export function maskPhone(rawPhone: string): string {
  const { isValid, normalized } = normalizePhone(rawPhone);
  if (!isValid) return '•••';
  const last3 = normalized.slice(-3);
  return `••• ${last3}`;
}

export function syntheticEmail(normalizedPhone: string, domainSlug = 'bhaibrother.app'): string {
  const digits = normalizedPhone.replace(/\D/g, '');
  return `${digits}@members.${domainSlug}`;
}
