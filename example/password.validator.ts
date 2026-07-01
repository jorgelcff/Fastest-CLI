/**
 * Example: password strength validator used for demonstrating Fastest CLI (batch mode).
 *
 * Rule-based logic with several branches and edge cases — ideal for exercising
 * AI-generated tests across many scenarios.
 */

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export type PasswordCheck = {
  valid: boolean;
  strength: PasswordStrength;
  errors: string[];
};

/**
 * Validates a password against a set of rules and returns a detailed result.
 *
 * Rules:
 * - at least 8 characters
 * - at least one lowercase and one uppercase letter
 * - at least one digit
 * - at least one special character
 *
 * Strength is `strong` when all rules pass, `medium` when only the length
 * and one character-class rule fail, and `weak` otherwise.
 */
export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters long.');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter.');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a digit.');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain a special character.');

  let strength: PasswordStrength;
  if (errors.length === 0) strength = 'strong';
  else if (errors.length <= 2) strength = 'medium';
  else strength = 'weak';

  return { valid: errors.length === 0, strength, errors };
}

/**
 * Convenience helper returning only whether the password satisfies all rules.
 */
export function isStrongPassword(password: string): boolean {
  return validatePassword(password).valid;
}
