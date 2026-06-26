import path from 'path';
import { LLMService, TestType } from './llm.service';
import {
  readFile,
  writeFile,
  getBaseName,
  stripCodeFences,
  buildPromptContextFromPaths,
  detectLanguage,
  testExtension,
  TestFramework,
} from '../utils/file.utils';
import { validateGeneratedTests } from '../utils/test-validation.utils';

export interface GenerateTestsOptions {
  card: string;
  filePath: string;
  testType?: TestType;
  framework?: TestFramework;
  outputDir?: string;
  contextPaths?: string[];
  maxContextFiles?: number;
  maxContextCharsPerFile?: number;
  maxContextTotalChars?: number;
  onToken?: (token: string) => void;
  maxRetries?: number;
  onRetry?: (attempt: number, errors: string) => void;
}

export interface GenerateTestsResult {
  testFilePath: string;
  testCount: number;
  generatedCode: string;
  testType: TestType;
  framework: TestFramework;
  retryAttempts: number;
  validationWarnings: string[];
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
      testType = 'unit',
      framework = 'jest',
      outputDir = 'tests',
      contextPaths = [],
      maxContextFiles,
      maxContextCharsPerFile,
      maxContextTotalChars,
      onToken,
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
    const prompt = this.llm.buildTestPrompt(card, promptCode, language, testType, framework);
    const rawResponse = onToken
      ? await this.llm.stream(prompt, onToken)
      : await this.llm.complete(prompt);
    const testCode = stripCodeFences(rawResponse);

    const baseName = getBaseName(filePath);
    const testFileName = `${baseName}${this.testSuffix(language, testType)}`;
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
    let fixedTestCode = testCode.replace(/from\s+['"][^'"]+['"]/i, `from '${relImport}'`);

    writeFile(testFilePath, fixedTestCode);

    let retryAttempts = 0;
    if (options.maxRetries && options.maxRetries > 0) {
      const CoverageServiceMod = require('./coverage.service').CoverageService;
      const coverageSvc = new CoverageServiceMod(process.cwd());

      for (let attempt = 0; attempt < options.maxRetries; attempt++) {
        const validation = coverageSvc.validateGeneratedFile(testFilePath);
        if (validation.valid) break;

        retryAttempts++;
        if (options.onRetry) options.onRetry(retryAttempts, validation.errors);

        const retryPrompt = this.llm.buildRetryPrompt(code, fixedTestCode, validation.errors, language, framework);
        const retryResponse = options.onToken
          ? await this.llm.stream(retryPrompt, options.onToken)
          : await this.llm.complete(retryPrompt);
        const retryCode = stripCodeFences(retryResponse);
        fixedTestCode = retryCode.replace(/from\s+['"][^'"]+['"]/i, `from '${relImport}'`);
        writeFile(testFilePath, fixedTestCode);
      }
    }

    const testCount = this.countTestCases(fixedTestCode);
    const validation = validateGeneratedTests(fixedTestCode, filePath, testFilePath);

    return {
      testFilePath,
      testCount,
      retryAttempts,
      generatedCode: testCode,
      testType,
      framework,
      validationWarnings: validation.warnings,
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

  private testSuffix(language: 'typescript' | 'javascript', testType: TestType): string {
    const base = testExtension(language); // .spec.ts | .spec.js
    if (testType === 'unit') return base;
    if (testType === 'use-case') return base.replace('.spec.', '.usecase.spec.');
    return base.replace('.spec.', '.integration.spec.');
  }
}
