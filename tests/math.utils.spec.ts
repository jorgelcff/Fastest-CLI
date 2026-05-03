import { add, subtract, multiply, divide, isPrime } from '../example/math.utils';

describe('Math Utility Functions', () => {
  describe('add', () => {
    it('should return the sum of two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should return the sum of a positive and a negative number', () => {
      expect(add(5, -3)).toBe(2);
    });

    it('should return the sum of two negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should return 0 when adding 0 to 0', () => {
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('should return the difference of two positive numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should return the difference when subtracting a larger number from a smaller number', () => {
      expect(subtract(3, 5)).toBe(-2);
    });

    it('should return the difference of a positive and a negative number', () => {
      expect(subtract(5, -3)).toBe(8);
    });

    it('should return 0 when subtracting a number from itself', () => {
      expect(subtract(5, 5)).toBe(0);
    });
  });

  describe('multiply', () => {
    it('should return the product of two positive numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('should return 0 when multiplying by 0', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it('should return a negative product when one number is negative', () => {
      expect(multiply(-2, 3)).toBe(-6);
    });

    it('should return a positive product when both numbers are negative', () => {
      expect(multiply(-2, -3)).toBe(6);
    });
  });

  describe('divide', () => {
    it('should return the quotient of two positive numbers', () => {
      expect(divide(6, 3)).toBe(2);
    });

    it('should return a negative quotient when dividing a positive by a negative', () => {
      expect(divide(6, -3)).toBe(-2);
    });

    it('should return a positive quotient when dividing two negative numbers', () => {
      expect(divide(-6, -3)).toBe(2);
    });

    it('should throw an error when dividing by zero', () => {
      expect(() => divide(6, 0)).toThrow('Division by zero');
    });
  });

  describe('isPrime', () => {
    it('should return true for prime numbers', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(5)).toBe(true);
      expect(isPrime(13)).toBe(true);
    });

    it('should return false for non-prime numbers', () => {
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(6)).toBe(false);
      expect(isPrime(9)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isPrime(-1)).toBe(false);
      expect(isPrime(-5)).toBe(false);
    });

    it('should return false for 0', () => {
      expect(isPrime(0)).toBe(false);
    });
  });
});