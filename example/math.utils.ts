/**
 * Example: simple math utility module used for demonstrating Fastest CLI.
 */

/**
 * Returns the sum of two numbers.
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Returns the difference of two numbers.
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Returns the product of two numbers.
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divides a by b. Throws if b is zero.
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

/**
 * Returns true if n is a prime number.
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
