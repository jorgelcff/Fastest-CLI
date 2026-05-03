import path from 'path';
import { LLMService } from './llm.service';
import {
  readFile,
  writeFile,
  getBaseName,
  stripCodeFences,
  buildPromptContextFromPaths,
  detectLanguage,
  testExtension,
} from '../utils/file.utils';

export interface GenerateTestsOptions {
  card: string;
  filePath: string;
  outputDir?: string;
  contextPaths?: string[];
  maxContextFiles?: number;
  maxContextCharsPerFile?: number;
  maxContextTotalChars?: number;
}

export interface GenerateTestsResult {
  testFilePath: string;
  testCount: number;
  generatedCode: string;
  language: 'typescript' | 'javascript';
  usedContextFiles: string[];
  skippedContextInputs: string[];
  truncatedContextFiles: string[];
  skippedByExtensionContextFiles: string[];
  skippedBinaryContextFiles: string[];
  limitedByMaxContextFiles: boolean;
  limitedByMaxTotalContextChars: boolean;
  totalContextCharsIncluded: number;
}

export class TestGeneratorService {
  constructor(private readonly llm: LLMService) {}

  /**
   * Generates Jest unit tests for the given source file using the LLM,
   * then saves the output to the tests directory.
   */
  async generate(options: GenerateTestsOptions): Promise<GenerateTestsResult> {
    const {
      card,
      filePath,
      outputDir = 'tests',
      contextPaths = [],
      maxContextFiles,
      maxContextCharsPerFile,
      maxContextTotalChars,
    } = options;

    const language = detectLanguage(filePath);
    const code = readFile(filePath);
    const context = buildPromptContextFromPaths(contextPaths, {
      baseDir: process.cwd(),
      maxFiles: maxContextFiles,
      maxCharsPerFile: maxContextCharsPerFile,
      maxTotalChars: maxContextTotalChars,
    });
    const promptCode = context.promptContext ? `${code}\n\n${context.promptContext}` : code;
    const prompt = this.llm.buildTestPrompt(card, promptCode, language);
    const rawResponse = await this.llm.complete(prompt);
    const testCode = stripCodeFences(rawResponse);

    const baseName = getBaseName(filePath);
    const testFileName = `${baseName}${testExtension(language)}`;
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

    return {
      testFilePath,
      testCount,
      generatedCode: testCode,
      language,
      usedContextFiles: context.usedFiles,
      skippedContextInputs: context.skippedInputs,
      truncatedContextFiles: context.truncatedFiles,
      skippedByExtensionContextFiles: context.skippedByExtensionFiles,
      skippedBinaryContextFiles: context.skippedBinaryFiles,
      limitedByMaxContextFiles: context.limitedByMaxFiles,
      limitedByMaxTotalContextChars: context.limitedByMaxTotalChars,
      totalContextCharsIncluded: context.totalCharsIncluded,
    };
  }

  /**
   * Counts the number of `it(` / `test(` calls in the generated test code.
   */
  private countTestCases(code: string): number {
    const matches = code.match(/^\s*(?:it|test)\s*\(/gm);
    return matches ? matches.length : 0;
  }
}
