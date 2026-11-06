import { maskPhone } from './phone';

/**
 * Privacy-safe Display Name per FR-LDB-04
 * Shows nickname if set, else "FirstName ••• 123"
 */
export function getSafeDisplayName(options: {
  fullName?: string | null;
  nickname?: string | null;
  phone?: string | null;
}): string {
  const { fullName, nickname, phone } = options;

  if (nickname && nickname.trim().length > 0) {
    return nickname.trim();
  }

  const firstName = fullName?.trim().split(/\s+/)[0] || 'Player';
  const maskedPhone = phone ? maskPhone(phone) : '•••';

  return `${firstName} ${maskedPhone}`;
}
