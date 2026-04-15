import path from 'path';
import { LLMService } from './llm.service';
import { readFile, writeFile, getBaseName, stripCodeFences } from '../utils/file.utils';

export interface GenerateTestsOptions {
  card: string;
  filePath: string;
  outputDir?: string;
}

export interface GenerateTestsResult {
  testFilePath: string;
  testCount: number;
  generatedCode: string;
}

export class TestGeneratorService {
  constructor(private readonly llm: LLMService) {}

  /**
   * Generates Jest unit tests for the given source file using the LLM,
   * then saves the output to the tests directory.
   */
  async generate(options: GenerateTestsOptions): Promise<GenerateTestsResult> {
    const { card, filePath, outputDir = 'tests' } = options;

    const code = readFile(filePath);
    const prompt = this.llm.buildTestPrompt(card, code);
    const rawResponse = await this.llm.complete(prompt);
    const testCode = stripCodeFences(rawResponse);

    const baseName = getBaseName(filePath);
    const testFileName = `${baseName}.spec.ts`;
    const testFilePath = path.join(outputDir, testFileName);

    writeFile(testFilePath, testCode);

    const testCount = this.countTestCases(testCode);

    return { testFilePath, testCount, generatedCode: testCode };
  }

  /**
   * Counts the number of `it(` / `test(` calls in the generated test code.
   */
  private countTestCases(code: string): number {
    const matches = code.match(/^\s*(?:it|test)\s*\(/gm);
    return matches ? matches.length : 0;
  }
}
