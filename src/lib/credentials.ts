export function usernameProblem(value: string): string | null {
  const name = value.trim().toLowerCase();
  if (!name) return 'Pick a username.';
  if (!/^[a-z0-9._-]{3,24}$/.test(name)) {
    return 'Use 3–24 characters: letters, numbers, dot, dash or underscore.';
  }
  return null;
}

export function passwordProblem(value: string): string | null {
  if (value.length < 8) return 'Use at least 8 characters.';
  if (value.length > 200) return 'That password is too long.';
  return null;
}

export function normalizeCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function codeProblem(value: string): string | null {
  return /^\d{6}$/.test(value) ? null : 'Enter the 6-digit code the main admin sent you.';
}
