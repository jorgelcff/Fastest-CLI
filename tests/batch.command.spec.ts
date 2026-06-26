/**
 * Tests for batch.command.ts
 */

jest.mock('../src/services/llm.service', () => {
  const MockCtor = jest.fn().mockImplementation(() => ({
    complete: jest.fn(),
    model: 'gpt-4o-mini',
  }));
  return { LLMService: MockCtor };
});
jest.mock('../src/services/test-generator.service');
jest.mock('ora', () => () => ({
  start:   jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail:    jest.fn().mockReturnThis(),
  warn:    jest.fn().mockReturnThis(),
}));

import path from 'path';
import fs from 'fs';
import { buildBatchCommand } from '../src/cli/batch.command';
import { LLMService } from '../src/services/llm.service';
import { TestGeneratorService } from '../src/services/test-generator.service';

const MockLLMService = LLMService as jest.MockedClass<typeof LLMService>;
const MockTestGenerator = TestGeneratorService as jest.MockedClass<typeof TestGeneratorService>;

let firstExitCode: number | undefined;
jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
  if (firstExitCode === undefined) firstExitCode = Number(code ?? 0);
  throw new Error(`process.exit(${code})`);
});

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Use a temp directory for test fixtures
const FIXTURES = path.join(__dirname, '__batch_fixtures__');

beforeAll(() => {
  fs.mkdirSync(path.join(FIXTURES, 'sub'), { recursive: true });
  fs.writeFileSync(path.join(FIXTURES, 'foo.ts'), 'export const foo = 1;');
  fs.writeFileSync(path.join(FIXTURES, 'bar.ts'), 'export const bar = 2;');
  fs.writeFileSync(path.join(FIXTURES, 'baz.spec.ts'), 'test("x", () => {});');
  fs.writeFileSync(path.join(FIXTURES, 'sub', 'deep.ts'), 'export const deep = 3;');
});

afterAll(() => {
  fs.rmSync(FIXTURES, { recursive: true, force: true });
});

function makeGeneratorMock(count = 5) {
  MockTestGenerator.mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      testFilePath: 'tests/foo.spec.ts',
      testCount: count,
      generatedCode: '',
      testType: 'unit',
      language: 'typescript',
      usedContextFiles: [],
      skippedContextInputs: [],
      truncatedContextFiles: [],
      skippedByExtensionContextFiles: [],
      skippedBinaryContextFiles: [],
      limitedByMaxContextFiles: false,
      limitedByMaxTotalContextChars: false,
      totalContextCharsIncluded: 0,
    }),
  } as unknown as TestGeneratorService));
}

function makeFailingGeneratorMock() {
  MockTestGenerator.mockImplementation(() => ({
    generate: jest.fn().mockRejectedValue(new Error('LLM timeout')),
  } as unknown as TestGeneratorService));
}

async function runBatch(extra: string[] = []) {
  firstExitCode = undefined;
  const cmd = buildBatchCommand();
  cmd.exitOverride();
  await cmd.parseAsync(['node', 'fastest', '--card=test card', `--files=${FIXTURES}`, ...extra]).catch(() => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  firstExitCode = undefined;
  process.env.OPENAI_API_KEY = 'sk-test';
});

afterEach(() => {
  delete process.env.OPENAI_API_KEY;
});

// ── Dry-run ──────────────────────────────────────────────────────────────────

describe('batch --dry-run', () => {
  it('lists files and exits with code 0', async () => {
    await runBatch(['--dry-run']);
    expect(firstExitCode).toBe(0);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('foo.ts');
    expect(logs).toContain('bar.ts');
    expect(logs).toContain('DRY-RUN');
  });

  it('does not instantiate LLMService', async () => {
    await runBatch(['--dry-run']);
    expect(MockLLMService).not.toHaveBeenCalled();
  });
});

// ── No files found ───────────────────────────────────────────────────────────

describe('batch — no files found', () => {
  it('exits with code 0 when no files match', async () => {
    firstExitCode = undefined;
    const cmd = buildBatchCommand();
    cmd.exitOverride();
    await cmd.parseAsync(['node', 'fastest', '--card=test', '--files=/nonexistent/path']).catch(() => {});
    expect(firstExitCode).toBe(0);
  });
});

// ── Filters test files ──────────────────────────────────────────────────────

describe('batch — file filtering', () => {
  it('excludes .spec.ts files', async () => {
    await runBatch(['--dry-run']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).not.toContain('baz.spec.ts');
  });

  it('includes files in subdirectories', async () => {
    await runBatch(['--dry-run']);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('deep.ts');
  });
});

// ── Successful batch ─────────────────────────────────────────────────────────

describe('batch — successful processing', () => {
  it('processes all files and exits with code 0', async () => {
    makeGeneratorMock(3);
    await runBatch();
    expect(firstExitCode).toBe(0);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Resumo');
    expect(logs).toContain('Sucesso:');
  });

  it('calls generator.generate for each file', async () => {
    makeGeneratorMock(3);
    await runBatch();
    const instance = MockTestGenerator.mock.results[0].value as { generate: jest.Mock };
    // 3 source files: foo.ts, bar.ts, sub/deep.ts
    expect(instance.generate).toHaveBeenCalledTimes(3);
  });
});

// ── Failed file tracking ─────────────────────────────────────────────────────

describe('batch — failed file tracking', () => {
  it('tracks failures and exits with code 1', async () => {
    makeFailingGeneratorMock();
    await runBatch();
    expect(firstExitCode).toBe(1);
    const logs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(logs).toContain('Falhas:');
    expect(logs).toContain('LLM timeout');
  });
});

// ── Invalid test type ────────────────────────────────────────────────────────

describe('batch — invalid test type', () => {
  it('throws for invalid --test-type', async () => {
    const cmd = buildBatchCommand();
    cmd.exitOverride();
    const err = await cmd.parseAsync([
      'node', 'fastest', '--card=test', `--files=${FIXTURES}`, '--test-type=banana',
    ]).catch((e: Error) => e);
    expect(err).toBeDefined();
    expect((err as Error).message).toMatch(/Invalid --test-type/);
  });
});

// ── Concurrency option ──────────────────────────────────────────────────────

describe('batch --concurrency', () => {
  it('limits files processed when concurrency is set', async () => {
    makeGeneratorMock(2);
    await runBatch(['--concurrency=1']);
    expect(firstExitCode).toBe(0);
    const instance = MockTestGenerator.mock.results[0].value as { generate: jest.Mock };
    expect(instance.generate).toHaveBeenCalledTimes(1);
  });
});
