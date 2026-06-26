import path from 'path';
import { TestGeneratorService } from '../src/services/test-generator.service';
import { LLMService } from '../src/services/llm.service';
import * as fileUtils from '../src/utils/file.utils';

jest.mock('../src/utils/file.utils', () => ({
  ...jest.requireActual('../src/utils/file.utils'),
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('../src/services/coverage.service', () => ({
  CoverageService: jest.fn().mockImplementation(() => ({
    validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
  })),
}));

const mockReadFile = fileUtils.readFile as jest.MockedFunction<typeof fileUtils.readFile>;
const mockWriteFile = fileUtils.writeFile as jest.MockedFunction<typeof fileUtils.writeFile>;

function makeMockLLM(response = 'const x = 1;'): LLMService {
  return {
    buildTestPrompt: LLMService.buildTestPrompt,
    buildCoverageSuggestionPrompt: LLMService.buildCoverageSuggestionPrompt,
    buildRetryPrompt: LLMService.buildRetryPrompt,
    complete: jest.fn().mockResolvedValue(response),
    stream: jest.fn().mockResolvedValue(response),
  } as unknown as LLMService;
}

describe('TestGeneratorService', () => {
  beforeEach(() => {
    mockReadFile.mockReturnValue('export function add(a: number, b: number) { return a + b; }');
    mockWriteFile.mockImplementation(() => undefined);
  });

  afterEach(() => jest.clearAllMocks());

  it('calls LLM complete and writes the result to disk', async () => {
    const llm = makeMockLLM('describe("add", () => { it("works", () => {}); });');
    const svc = new TestGeneratorService(llm);

    const result = await svc.generate({
      card: 'Test add function',
      filePath: 'src/math.ts',
      outputDir: 'tests',
    });

    expect(llm.complete).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(result.testFilePath).toBe(path.join('tests', 'math.spec.ts'));
    expect(result.testType).toBe('unit');
    expect(result.validationWarnings).toBeDefined();
  });

  it('strips markdown code fences from LLM response', async () => {
    const llm = makeMockLLM('```typescript\nconst x = 1;\n```');
    const svc = new TestGeneratorService(llm);

    await svc.generate({ card: 'card', filePath: 'src/foo.ts', outputDir: 'tests' });

    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).not.toContain('```');
    expect(writtenContent).toContain('const x = 1;');
  });

  it('counts test cases in generated code', async () => {
    const code = `
      it('case 1', () => {});
      it('case 2', () => {});
      test('case 3', () => {});
    `;
    const llm = makeMockLLM(code);
    const svc = new TestGeneratorService(llm);

    const result = await svc.generate({ card: 'c', filePath: 'src/svc.ts', outputDir: 'tests' });
    expect(result.testCount).toBe(3);
  });

  it('fixes the import path in generated code', async () => {
    const code = `import { add } from '../wrong/path';\ndescribe('add', () => {});`;
    const llm = makeMockLLM(code);
    const svc = new TestGeneratorService(llm);

    await svc.generate({ card: 'c', filePath: 'src/math.ts', outputDir: 'tests' });

    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    // Should not contain the wrong path
    expect(writtenContent).not.toContain('../wrong/path');
    // Should have a relative import pointing toward src/math
    expect(writtenContent).toContain('from \'');
  });

  it('returns empty context metadata when no contextPaths provided', async () => {
    const llm = makeMockLLM();
    const svc = new TestGeneratorService(llm);

    const result = await svc.generate({ card: 'c', filePath: 'src/foo.ts', outputDir: 'tests' });

    expect(result.usedContextFiles).toHaveLength(0);
    expect(result.skippedContextInputs).toHaveLength(0);
    expect(result.totalContextCharsIncluded).toBe(0);
    expect(result.validationWarnings).toBeDefined();
  });

  it('returns retryAttempts 0 when no retries configured', async () => {
    const llm = makeMockLLM('describe("add", () => { it("works", () => {}); });');
    const svc = new TestGeneratorService(llm);

    const result = await svc.generate({
      card: 'Test add function',
      filePath: 'src/math.ts',
      outputDir: 'tests',
    });

    expect(result.retryAttempts).toBe(0);
  });

  it('retries when validation fails and calls LLM again', async () => {
    const { CoverageService } = require('../src/services/coverage.service');
    const mockValidate = jest.fn()
      .mockReturnValueOnce({ valid: false, errors: 'Type error: blah' })
      .mockReturnValueOnce({ valid: true, errors: '' });
    CoverageService.mockImplementation(() => ({
      validateGeneratedFile: mockValidate,
    }));

    const llm = makeMockLLM("import { add } from './math';\ndescribe('add', () => { it('works', () => {}); });");
    const svc = new TestGeneratorService(llm);

    const onRetry = jest.fn();
    const result = await svc.generate({
      card: 'Test add',
      filePath: 'src/math.ts',
      outputDir: 'tests',
      maxRetries: 3,
      onRetry,
    });

    expect(result.retryAttempts).toBe(1);
    expect(onRetry).toHaveBeenCalledWith(1, 'Type error: blah');
    expect(llm.complete).toHaveBeenCalledTimes(2); // initial + 1 retry
  });

  it('retry stops when validation succeeds on first check', async () => {
    const { CoverageService } = require('../src/services/coverage.service');
    CoverageService.mockImplementation(() => ({
      validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
    }));

    const llm = makeMockLLM("import { add } from './math';\ndescribe('add', () => { it('works', () => {}); });");
    const svc = new TestGeneratorService(llm);

    const result = await svc.generate({
      card: 'Test add',
      filePath: 'src/math.ts',
      outputDir: 'tests',
      maxRetries: 3,
    });

    expect(result.retryAttempts).toBe(0);
    expect(llm.complete).toHaveBeenCalledTimes(1); // only initial call
  });

  it('uses use-case naming when requested', async () => {
    const llm = makeMockLLM('describe("use-case", () => { it("works", () => {}); });');
    const svc = new TestGeneratorService(llm);
    const result = await svc.generate({
      card: 'c',
      filePath: 'src/foo.ts',
      outputDir: 'tests',
      testType: 'use-case',
    });
    expect(result.testType).toBe('use-case');
    expect(result.testFilePath).toBe(path.join('tests', 'foo.usecase.spec.ts'));
  });

  it('uses integration naming when requested', async () => {
    const llm = makeMockLLM('describe("integration", () => { it("works", () => {}); });');
    const svc = new TestGeneratorService(llm);

    const result = await svc.generate({
      card: 'c',
      filePath: 'src/foo.ts',
      outputDir: 'tests',
      testType: 'integration',
    });

    expect(result.testType).toBe('integration');
    expect(result.testFilePath).toBe(path.join('tests', 'foo.integration.spec.ts'));
    expect(result.validationWarnings).toBeDefined();
  });
});
