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
  } as unknown as CoverageService));
}

function makeGeneratorMock(count = 10) {
  MockTestGenerator.mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      testFilePath: 'tests/math.utils.spec.ts', testCount: count, generatedCode: '',
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
});

// ── process.exit contract ─────────────────────────────────────────────────────

describe('generate — process.exit contract', () => {
  it('always calls process.exit', async () => {
    await runGenerate(['--dry-run']);
    expect(firstExitCode).toBeDefined();
  });
});
