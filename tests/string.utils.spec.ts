import {
  capitalize,
  slugify,
  truncate,
  isPalindrome,
  countWords,
} from "../example/string.utils";

describe("String Utility Functions", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should lowercase the rest of the string", () => {
      expect(capitalize("hELLO")).toBe("Hello");
    });

    it("should return an empty string when given an empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("slugify", () => {
    it("should convert a string to a URL-friendly slug", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
    });

    it("should remove accents and special characters", () => {
      expect(slugify("Olá, Mundo!")).toBe("ola-mundo");
    });

    it("should trim and replace multiple spaces with a single hyphen", () => {
      expect(slugify("  Hello   World  ")).toBe("hello-world");
    });

    it("should return an empty string when given an empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("should truncate a string to max characters and append ellipsis", () => {
      expect(truncate("Hello World", 5)).toBe("Hello…");
    });

    it("should return the original string if it is shorter than max", () => {
      expect(truncate("Hi", 5)).toBe("Hi");
    });

    it("should throw an error if max is negative", () => {
      expect(() => truncate("Hello", -1)).toThrow(
        "Invalid max length: -1. Must be zero or greater.",
      );
    });

    it("should return an empty string when given an empty string and max is greater than 0", () => {
      expect(truncate("", 5)).toBe("");
    });
  });

  describe("isPalindrome", () => {
    it("should return true for a palindrome string", () => {
      expect(isPalindrome("A man, a plan, a canal, Panama")).toBe(true);
    });

    it("should return false for a non-palindrome string", () => {
      expect(isPalindrome("Hello")).toBe(false);
    });

    it("should return false for an empty string", () => {
      expect(isPalindrome("")).toBe(false);
    });

    it("should ignore non-alphanumeric characters", () => {
      expect(isPalindrome("No x in Nixon")).toBe(true);
    });
  });

  describe("countWords", () => {
    it("should count the number of words in a string", () => {
      expect(countWords("Hello World")).toBe(2);
    });

    it("should return 0 for an empty string", () => {
      expect(countWords("")).toBe(0);
    });

    it("should count words separated by multiple spaces", () => {
      expect(countWords("Hello    World")).toBe(2);
    });

    it("should return 0 for a string with only spaces", () => {
      expect(countWords("     ")).toBe(0);
    });
  });
});
