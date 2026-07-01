/**
 * Example: array utility module used for demonstrating Fastest CLI (batch mode).
 *
 * Generic helpers with clear edge cases (empty inputs, invalid sizes) that
 * exercise both happy paths and error handling.
 */

/**
 * Splits an array into chunks of the given size.
 * Throws if `size` is not a positive integer.
 */
export function chunk<T>(items: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error(`Invalid chunk size: ${size}. Must be a positive integer.`);
  }
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/**
 * Returns a new array with duplicate values removed, preserving order.
 */
export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

/**
 * Sums an array of numbers. Returns 0 for an empty array.
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

/**
 * Returns the arithmetic mean of an array of numbers.
 * Throws if the array is empty.
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot compute the average of an empty array.');
  }
  return sum(numbers) / numbers.length;
}

/**
 * Builds an array of integers from `start` (inclusive) to `end` (exclusive).
 * Throws if `end` is smaller than `start`.
 */
export function range(start: number, end: number): number[] {
  if (end < start) {
    throw new Error(`Invalid range: end (${end}) must be >= start (${start}).`);
  }
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

/**
 * Returns the last element of an array, or undefined when empty.
 */
export function last<T>(items: T[]): T | undefined {
  return items.length === 0 ? undefined : items[items.length - 1];
}
