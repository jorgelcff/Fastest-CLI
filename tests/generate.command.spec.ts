/**
 * Tests for generate.command.ts — dry-run and error paths.
 */

jest.mock('../src/services/llm.service', () => {
  const { LLMService: Actual } = jest.requireActual('../src/services/llm.service');
  const MockCtor = jest.fn().mockImplementation(() => ({
    complete: jest.fn(),
    buildTestPrompt: Actual.buildTestPrompt,
    buildCoverageSuggestionPrompt: Actual.buildCoverageSuggestionPrompt,
  }));
  // Preserve static methods so dry-run path (which calls LLMService.buildTestPrompt) works
  (MockCtor as unknown as Record<string, unknown>).buildTestPrompt = Actual.buildTestPrompt;
  (MockCtor as unknown as Record<string, unknown>).buildCoverageSuggestionPrompt = Actual.buildCoverageSuggestionPrompt;
  return { LLMService: MockCtor };
});
jest.mock('../src/services/test-generator.service');
jest.mock('../src/services/coverage.service');
jest.mock('../src/utils/file.utils', () => ({
  ...jest.requireActual('../src/utils/file.utils'),
  readFile: jest.fn(),
  buildPromptContextFromPaths: jest.fn().mockReturnValue({
    promptContext: '', usedFiles: [], totalCharsIncluded: 0,
    skippedInputs: [], skippedByExtensionFiles: [], skippedBinaryFiles: [],
    truncatedFiles: [], limitedByMaxFiles: false, limitedByMaxTotalChars: false,
  }),
}));
jest.mock('ora', () => () => ({
  start:   jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail:    jest.fn().mockReturnThis(),
  warn:    jest.fn().mockReturnThis(),
}));

import { buildGenerateCommand } from '../src/cli/generate.command';
import { LLMService } from '../src/services/llm.service';
import { TestGeneratorService } from '../src/services/test-generator.service';
import { CoverageService } from '../src/services/coverage.service';
import * as fileUtils from '../src/utils/file.utils';

const MockLLMService = LLMService as jest.MockedClass<typeof LLMService>;
const MockTestGenerator = TestGeneratorService as jest.MockedClass<typeof TestGeneratorService>;
const MockCoverageService = CoverageService as jest.MockedClass<typeof CoverageService>;
const mockReadFile = fileUtils.readFile as jest.MockedFunction<typeof fileUtils.readFile>;

let firstExitCode: number | undefined;
// Throw to stop execution at the exit point.
// cmd.exitOverride() ensures Commander doesn't intercept and overwrite with exit(1).
jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
  if (firstExitCode === undefined) firstExitCode = Number(code ?? 0);
  throw new Error(`process.exit(${code})`);
});

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Base required options — cmd IS the generate command, omit 'generate' token
const BASE = ['node', 'fastest', '--card=test card', '--file=example/math.utils.ts'];

function makeCoverageMock(success = true) {
  MockCoverageService.mockImplementation(() => ({
    runWithCoverage: jest.fn().mockReturnValue({
      success, output: success ? '' : 'FAIL',
      coverageSummary: '',
      coverageData: success ? { statements: 90, branches: 80, functions: 100, lines: 90 } : undefined,
    }),
    readCoverageForFile: jest.fn().mockReturnValue(
      success ? { statements: 90, branches: 80, functions: 100, lines: 90 } : undefined,
    ),
    validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
    analyzeCriticalFlowGaps: jest.fn().mockReturnValue([]),
  } as unknown as CoverageService));
}

function makeGeneratorMock(count = 10, testType: 'unit' | 'integration' = 'unit') {
  MockTestGenerator.mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      testFilePath: testType === 'integration' ? 'tests/math.utils.integration.spec.ts' : 'tests/math.utils.spec.ts',
      testCount: count, generatedCode: '', testType,
      language: 'typescript',
      usedContextFiles: [], skippedContextInputs: [], truncatedContextFiles: [],
      skippedByExtensionContextFiles: [], skippedBinaryContextFiles: [],
      limitedByMaxContextFiles: false, limitedByMaxTotalContextChars: false, totalContextCharsIncluded: 0,
    }),
  } as unknown as TestGeneratorService));
}

function makeLLMMock() {
  MockLLMService.mockImplementation(() => ({
    complete: jest.fn(),
    buildTestPrompt: LLMService.buildTestPrompt,
    buildCoverageSuggestionPrompt: LLMService.buildCoverageSuggestionPrompt,
  } as unknown as LLMService));
}

async function runGenerate(extra: string[] = []) {
  firstExitCode = undefined;
  const cmd = buildGenerateCommand();
  cmd.exitOverride();
  await cmd.parseAsync([...BASE, ...extra]).catch(() => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  firstExitCode = undefined;
  process.env.OPENAI_API_KEY = 'sk-test';
  mockReadFile.mockReturnValue('export function add(a: number, b: number) { return a + b; }');
});

afterEach(() => {
  delete process.env.OPENAI_API_KEY;
});

// ── Dry-run ───────────────────────────────────────────────────────────────────

describe('generate --dry-run', () => {
  it('exits with code 0', async () => {
    await runGenerate(['--dry-run']);
    expect(firstExitCode).toBe(0);
  });

  it('does not instantiate LLMService', async () => {
    await runGenerate(['--dry-run']);
    expect(MockLLMService).not.toHaveBeenCalled();
  });

  it('does not instantiate TestGeneratorService', async () => {
    await runGenerate(['--dry-run']);
    expect(MockTestGenerator).not.toHaveBeenCalled();
  });

  it('does not instantiate CoverageService', async () => {
    await runGenerate(['--dry-run']);
    expect(MockCoverageService).not.toHaveBeenCalled();
  });

  it('exits with code 1 when source file does not exist', async () => {
    mockReadFile.mockImplementation(() => { throw new Error('File not found'); });
    await runGenerate(['--dry-run']);
    expect(firstExitCode).toBe(1);
  });

  it('logs configuration info', async () => {
    await runGenerate(['--dry-run']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toMatch(/Configuração|gpt-4o-mini|Arquivo fonte/i);
  });

  it('includes custom --output path in output', async () => {
    await runGenerate(['--dry-run', '--output=custom-tests']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('custom-tests');
  });
});

// ── Missing API key ───────────────────────────────────────────────────────────

describe('generate — missing API key', () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    MockLLMService.mockImplementation(() => {
      throw new Error('OpenAI API key is required');
    });
    makeCoverageMock();
  });

  it('exits with code 1', async () => {
    await runGenerate();
    expect(firstExitCode).toBe(1);
  });

  it('logs an error about the missing key', async () => {
    await runGenerate();
    const errLogs = (console.error as jest.Mock).mock.calls.flat().join('\n');
    expect(errLogs).toMatch(/OpenAI API key/i);
  });
});

// ── Generation failure ────────────────────────────────────────────────────────

describe('generate — test generation failure', () => {
  it('exits with code 1 when TestGeneratorService throws', async () => {
    makeLLMMock();
    makeCoverageMock();
    MockTestGenerator.mockImplementation(() => ({
      generate: jest.fn().mockRejectedValue(new Error('LLM timeout')),
    } as unknown as TestGeneratorService));

    await runGenerate();
    expect(firstExitCode).toBe(1);
  });
});

// ── Successful pipeline ───────────────────────────────────────────────────────

describe('generate — full pipeline', () => {
  it('exits with code 0 when tests pass', async () => {
    makeLLMMock();
    makeCoverageMock(true);
    makeGeneratorMock();
    await runGenerate();
    expect(firstExitCode).toBe(0);
  });

  it('exits with code 1 when tests fail', async () => {
    makeLLMMock();
    makeCoverageMock(false);
    makeGeneratorMock();
    await runGenerate();
    expect(firstExitCode).toBe(1);
  });

  it('passes integration mode to generator', async () => {
    makeLLMMock();
    makeCoverageMock(true);
    makeGeneratorMock(10, 'integration');
    await runGenerate(['--test-type=integration']);
    const instance = MockTestGenerator.mock.results[0].value as { generate: jest.Mock };
    expect(instance.generate).toHaveBeenCalledWith(expect.objectContaining({ testType: 'integration' }));
    expect(firstExitCode).toBe(0);
  });
});

// ── Context warnings in dry-run ──────────────────────────────────────────────

describe('generate --dry-run — context warnings', () => {
  it('displays skippedInputs warning', async () => {
    (fileUtils.buildPromptContextFromPaths as jest.Mock).mockReturnValueOnce({
      promptContext: 'ctx', usedFiles: ['a.ts'], totalCharsIncluded: 100,
      skippedInputs: ['bad-path'], skippedByExtensionFiles: [], skippedBinaryFiles: [],
      truncatedFiles: [], limitedByMaxFiles: false, limitedByMaxTotalChars: false,
    });
    await runGenerate(['--dry-run', '--context=some-path']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Inputs ignorados');
  });

  it('displays truncatedFiles warning', async () => {
    (fileUtils.buildPromptContextFromPaths as jest.Mock).mockReturnValueOnce({
      promptContext: 'ctx', usedFiles: ['a.ts'], totalCharsIncluded: 100,
      skippedInputs: [], skippedByExtensionFiles: [], skippedBinaryFiles: [],
      truncatedFiles: ['big.ts'], limitedByMaxFiles: false, limitedByMaxTotalChars: false,
    });
    await runGenerate(['--dry-run', '--context=some-path']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Arquivos truncados');
  });

  it('displays limitedByMaxFiles warning', async () => {
    (fileUtils.buildPromptContextFromPaths as jest.Mock).mockReturnValueOnce({
      promptContext: 'ctx', usedFiles: ['a.ts'], totalCharsIncluded: 100,
      skippedInputs: [], skippedByExtensionFiles: [], skippedBinaryFiles: [],
      truncatedFiles: [], limitedByMaxFiles: true, limitedByMaxTotalChars: false,
    });
    await runGenerate(['--dry-run', '--context=some-path']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Limite de arquivos atingido');
  });
});

// ── Strict context abort (dry-run) ──────────────────────────────────────────

describe('generate --dry-run --strict-context', () => {
  it('exits with code 1 when context has violations', async () => {
    (fileUtils.buildPromptContextFromPaths as jest.Mock).mockReturnValueOnce({
      promptContext: 'ctx', usedFiles: ['a.ts'], totalCharsIncluded: 100,
      skippedInputs: ['bad'], skippedByExtensionFiles: [], skippedBinaryFiles: [],
      truncatedFiles: [], limitedByMaxFiles: false, limitedByMaxTotalChars: false,
    });
    await runGenerate(['--dry-run', '--strict-context', '--context=some-path']);
    expect(firstExitCode).toBe(1);
    const errLogs = (console.error as jest.Mock).mock.calls.flat().join('\n');
    expect(errLogs).toContain('Strict context');
  });
});

// ── Strict context abort (generation) ───────────────────────────────────────

describe('generate --strict-context — generation violations', () => {
  it('exits with code 1 when generation result has context violations', async () => {
    makeLLMMock();
    makeCoverageMock(true);
    MockTestGenerator.mockImplementation(() => ({
      generate: jest.fn().mockResolvedValue({
        testFilePath: 'tests/math.utils.spec.ts',
        testCount: 5, generatedCode: '', testType: 'unit',
        language: 'typescript',
        usedContextFiles: [], skippedContextInputs: ['skipped-input'],
        truncatedContextFiles: [], skippedByExtensionContextFiles: [],
        skippedBinaryContextFiles: [], limitedByMaxContextFiles: false,
        limitedByMaxTotalContextChars: false, totalContextCharsIncluded: 0,
      }),
    } as unknown as TestGeneratorService));

    await runGenerate(['--strict-context']);
    expect(firstExitCode).toBe(1);
    const errLogs = (console.error as jest.Mock).mock.calls.flat().join('\n');
    expect(errLogs).toContain('Strict context');
  });
});

// ── TypeScript validation warnings ──────────────────────────────────────────

describe('generate — TypeScript validation warning', () => {
  it('shows warning when validation fails but continues', async () => {
    makeLLMMock();
    makeGeneratorMock();
    MockCoverageService.mockImplementation(() => ({
      runWithCoverage: jest.fn().mockReturnValue({
        success: true, output: '', coverageSummary: '',
        coverageData: { statements: 90, branches: 80, functions: 100, lines: 90 },
      }),
      readCoverageForFile: jest.fn().mockReturnValue(
        { statements: 90, branches: 80, functions: 100, lines: 90 },
      ),
      validateGeneratedFile: jest.fn().mockReturnValue({ valid: false, errors: 'TS2345: Argument error' }),
      analyzeCriticalFlowGaps: jest.fn().mockReturnValue([]),
    } as unknown as CoverageService));

    await runGenerate();
    expect(firstExitCode).toBe(0);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('TS2345');
  });
});

// ── Coverage display paths ──────────────────────────────────────────────────

describe('generate — coverage display', () => {
  it('shows coverageData table when afterCoverage is undefined', async () => {
    makeLLMMock();
    makeGeneratorMock();
    MockCoverageService.mockImplementation(() => ({
      runWithCoverage: jest.fn().mockReturnValue({
        success: true, output: '', coverageSummary: '',
        coverageData: { statements: 85, branches: 70, functions: 95, lines: 88 },
      }),
      readCoverageForFile: jest.fn()
        .mockReturnValueOnce({ statements: 50, branches: 50, functions: 50, lines: 50 }) // baseline
        .mockReturnValueOnce(undefined), // after — undefined triggers fallback
      validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
      analyzeCriticalFlowGaps: jest.fn().mockReturnValue([]),
    } as unknown as CoverageService));

    await runGenerate();
    expect(firstExitCode).toBe(0);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('85%');
  });

  it('shows coverageSummary text when no coverage data available', async () => {
    makeLLMMock();
    makeGeneratorMock();
    MockCoverageService.mockImplementation(() => ({
      runWithCoverage: jest.fn().mockReturnValue({
        success: true, output: '', coverageSummary: 'No coverage data found',
        coverageData: undefined,
      }),
      readCoverageForFile: jest.fn()
        .mockReturnValueOnce({ statements: 0, branches: 0, functions: 0, lines: 0 })
        .mockReturnValueOnce(undefined),
      validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
      analyzeCriticalFlowGaps: jest.fn().mockReturnValue([]),
    } as unknown as CoverageService));

    await runGenerate();
    expect(firstExitCode).toBe(0);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('No coverage data found');
  });
});

// ── Critical flow gaps ──────────────────────────────────────────────────────

describe('generate — critical flow gaps', () => {
  it('displays gaps when analyzeCriticalFlowGaps returns results', async () => {
    makeLLMMock();
    makeGeneratorMock();
    MockCoverageService.mockImplementation(() => ({
      runWithCoverage: jest.fn().mockReturnValue({
        success: true, output: '', coverageSummary: '',
        coverageData: { statements: 90, branches: 80, functions: 100, lines: 90 },
      }),
      readCoverageForFile: jest.fn().mockReturnValue(
        { statements: 90, branches: 80, functions: 100, lines: 90 },
      ),
      validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
      analyzeCriticalFlowGaps: jest.fn().mockReturnValue([
        { message: 'Missing error handler test', score: 45 },
      ]),
    } as unknown as CoverageService));

    await runGenerate();
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Missing error handler test');
    expect(logs).toContain('45%');
  });
});

// ── Failed test output ──────────────────────────────────────────────────────

describe('generate — failed test output', () => {
  it('displays Jest output when tests fail', async () => {
    makeLLMMock();
    makeGeneratorMock();
    MockCoverageService.mockImplementation(() => ({
      runWithCoverage: jest.fn().mockReturnValue({
        success: false, output: 'FAIL src/math.utils.spec.ts\nExpected 1 but got 2',
        coverageSummary: '', coverageData: undefined,
      }),
      readCoverageForFile: jest.fn().mockReturnValue(undefined),
      validateGeneratedFile: jest.fn().mockReturnValue({ valid: true, errors: '' }),
      analyzeCriticalFlowGaps: jest.fn().mockReturnValue([]),
    } as unknown as CoverageService));

    await runGenerate();
    expect(firstExitCode).toBe(1);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Expected 1 but got 2');
    expect(logs).toContain('Saída do Jest');
  });
});

// ── Suggest mode ────────────────────────────────────────────────────────────

describe('generate --suggest', () => {
  it('calls llm.complete and displays suggestions', async () => {
    const mockComplete = jest.fn().mockResolvedValue('Suggestion: test edge case X');
    MockLLMService.mockImplementation(() => ({
      complete: mockComplete,
      model: 'gpt-4o-mini',
      buildTestPrompt: LLMService.buildTestPrompt,
      buildCoverageSuggestionPrompt: jest.fn().mockReturnValue('suggestion prompt'),
    } as unknown as LLMService));
    makeCoverageMock(true);
    makeGeneratorMock();

    await runGenerate(['--suggest']);
    expect(firstExitCode).toBe(0);
    expect(mockComplete).toHaveBeenCalled();
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Suggestion: test edge case X');
  });

  it('shows warning when suggest throws', async () => {
    const mockComplete = jest.fn().mockRejectedValue(new Error('LLM unavailable'));
    MockLLMService.mockImplementation(() => ({
      complete: mockComplete,
      model: 'gpt-4o-mini',
      buildTestPrompt: LLMService.buildTestPrompt,
      buildCoverageSuggestionPrompt: jest.fn().mockReturnValue('suggestion prompt'),
    } as unknown as LLMService));
    makeCoverageMock(true);
    makeGeneratorMock();

    await runGenerate(['--suggest']);
    expect(firstExitCode).toBe(0);
    // The warn path is hit but execution continues to success
  });
});

// ── parseTestType invalid ───────────────────────────────────────────────────

describe('generate — invalid test type', () => {
  it('rejects with an error for invalid --test-type', async () => {
    const cmd = buildGenerateCommand();
    cmd.exitOverride();
    const err = await cmd.parseAsync([...BASE, '--test-type=banana']).catch((e: Error) => e);
    expect(err).toBeDefined();
    expect((err as Error).message).toMatch(/Invalid --test-type/);
  });
});

// ── process.exit contract ─────────────────────────────────────────────────────

describe('generate — process.exit contract', () => {
  it('always calls process.exit', async () => {
    await runGenerate(['--dry-run']);
    expect(firstExitCode).toBeDefined();
  });
});
