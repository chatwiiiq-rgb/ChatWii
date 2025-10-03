// Nickname validation utilities

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateNickname(nickname: string): ValidationResult {
  // Length check
  if (nickname.length < 3) {
    return { valid: false, error: 'Nickname too short (minimum 3 characters)' };
  }
  if (nickname.length > 20) {
    return { valid: false, error: 'Nickname too long (maximum 20 characters)' };
  }

  // Digit count (max 2)
  const digits = (nickname.match(/\d/g) || []).length;
  if (digits > 2) {
    return { valid: false, error: 'Maximum 2 digits allowed' };
  }

  // Repeated letters (max 3 consecutive)
  const repeatedLetters = nickname.match(/(.)\1{3,}/g);
  if (repeatedLetters) {
    return { valid: false, error: 'Maximum 3 repeated letters allowed' };
  }

  // Consecutive spaces check
  if (/\s{2,}/.test(nickname)) {
    return { valid: false, error: 'No consecutive spaces allowed' };
  }

  // Allowed characters (letters, numbers, space, hyphen, underscore)
  if (!/^[a-zA-Z0-9\s_-]+$/.test(nickname)) {
    return {
      valid: false,
      error: 'Only letters, numbers, spaces, hyphens, and underscores allowed',
    };
  }

  // Forbidden words (case-insensitive)
  const forbidden = ['allah', 'admin'];
  const lower = nickname.toLowerCase();
  if (forbidden.some((word) => lower.includes(word))) {
    return { valid: false, error: 'Nickname not allowed' };
  }

  return { valid: true };
}
