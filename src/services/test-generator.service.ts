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

    // Post-process generated test code to ensure import path points to the
    // original source file (relative to the generated test file). This
    // fixes cases where the LLM guesses a different module name or path.
    const absSource = path.resolve(filePath);
    const rel = path.relative(path.dirname(testFilePath), absSource);
    let relImport = rel.replace(/\\/g, '/');
    // remove extension
    relImport = relImport.replace(new RegExp(`${path.extname(relImport)}$`), '');
    if (!relImport.startsWith('.')) relImport = './' + relImport;

    // Replace the first `from '\"...\"';` / `from '\'...\'`;` occurrence to point
    // to the correct relative import. This is conservative and targets the
    // common top-level import the LLM adds.
    const fixedTestCode = testCode.replace(/from\s+['"][^'"]+['"]/i, `from '${relImport}'`);

    writeFile(testFilePath, fixedTestCode);

    const testCount = this.countTestCases(fixedTestCode);

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
