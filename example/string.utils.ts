/**
 * Example: string utility module used for demonstrating Fastest CLI (batch mode).
 *
 * Small, self-contained functions with edge cases — good candidates for
 * AI-powered unit test generation.
 */

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 * Returns an empty string when given an empty string.
 */
export function capitalize(value: string): string {
  if (value.length === 0) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Converts a string into a URL-friendly slug.
 * Lowercases, trims, removes accents and replaces non-alphanumeric runs with a hyphen.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncates a string to `max` characters, appending an ellipsis when cut.
 * Throws if `max` is negative.
 */
export function truncate(value: string, max: number): string {
  if (max < 0) {
    throw new Error(`Invalid max length: ${max}. Must be zero or greater.`);
  }
  if (value.length <= max) return value;
  return value.slice(0, max) + '…';
}

/**
 * Returns true if the string is a palindrome, ignoring case and non-alphanumerics.
 */
export function isPalindrome(value: string): boolean {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleaned.length === 0) return false;
  return cleaned === cleaned.split('').reverse().join('');
}

/**
 * Counts the number of words in a string (whitespace-separated).
 */
export function countWords(value: string): number {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}
