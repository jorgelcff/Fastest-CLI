import { add, subtract, multiply, divide, isPrime } from '../example/math.utils';

describe('add', () => {
  it('should return the sum of two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should return the correct sum when one number is negative', () => {
    expect(add(-1, 5)).toBe(4);
  });

  it('should return zero when both numbers are zero', () => {
    expect(add(0, 0)).toBe(0);
  });
});

describe('subtract', () => {
  it('should return the difference of two numbers', () => {
    expect(subtract(10, 4)).toBe(6);
  });

  it('should return a negative number when second is larger', () => {
    expect(subtract(3, 7)).toBe(-4);
  });
});

describe('multiply', () => {
  it('should return the product of two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it('should return zero when one operand is zero', () => {
    expect(multiply(5, 0)).toBe(0);
  });
});

describe('divide', () => {
  it('should return the quotient of two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw an error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});

describe('isPrime', () => {
  it('should return true for prime numbers', () => {
    expect(isPrime(7)).toBe(true);
    expect(isPrime(13)).toBe(true);
  });

  it('should return false for non-prime numbers', () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(9)).toBe(false);
  });

  it('should return false for numbers less than 2', () => {
    expect(isPrime(1)).toBe(false);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  it('should return true for 2 (smallest prime)', () => {
    expect(isPrime(2)).toBe(true);
  });
});
