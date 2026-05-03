/**
 * Tests for doctor.command.ts.
 */

jest.mock('fs');
jest.mock('../src/utils/file.utils', () => ({
  buildPromptContextFromPaths: jest.fn().mockReturnValue({
    usedFiles: [], totalCharsIncluded: 0,
    skippedInputs: [], skippedByExtensionFiles: [], skippedBinaryFiles: [],
    truncatedFiles: [], limitedByMaxFiles: false, limitedByMaxTotalChars: false,
  }),
}));
jest.mock('../src/config/config.manager', () => ({
  resolveApiKey: jest.fn(),
  maskKey: jest.fn((k: string) => `${k.slice(0, 4)}...`),
  getConfigPath: jest.fn(() => '/home/user/.fastest/config.json'),
}));

import fs from 'fs';
import { buildDoctorCommand } from '../src/cli/doctor.command';
import { resolveApiKey } from '../src/config/config.manager';

const mockFs = fs as jest.Mocked<typeof fs>;
const mockResolveApiKey = resolveApiKey as jest.MockedFunction<typeof resolveApiKey>;

// Track exit code without stopping execution (no throw — avoids Commander's own exit interception)
let firstExitCode: number | undefined;
jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
  if (firstExitCode === undefined) firstExitCode = Number(code ?? 0);
  return undefined as never;
});

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

function makeAllFilesExist() {
  mockFs.existsSync.mockImplementation((p) => {
    const s = String(p);
    return s.endsWith('package.json') || s.endsWith('jest.config.js') ||
           s.endsWith('tsconfig.json') || s.endsWith('.env');
  });
  // Return different content depending on which file is read
  (mockFs.readFileSync as jest.Mock).mockImplementation((p: unknown) => {
    if (String(p).endsWith('.env')) return 'OPENAI_API_KEY=sk-real-key\n';
    return JSON.stringify({ scripts: { test: 'jest' } });
  });
  mockResolveApiKey.mockReturnValue({ key: 'sk-test-key', source: 'env' });
}

async function runDoctor(args: string[] = []) {
  firstExitCode = undefined;
  // cmd IS the doctor command — don't repeat 'doctor' in args
  const cmd = buildDoctorCommand();
  cmd.exitOverride(); // prevents Commander from swallowing errors with its own process.exit
  await cmd.parseAsync(['node', 'fastest', ...args]).catch(() => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  firstExitCode = undefined;
});

// ── All checks pass ───────────────────────────────────────────────────────────

describe('doctor — all checks pass', () => {
  it('exits with code 0', async () => {
    makeAllFilesExist();
    await runDoctor();
    expect(firstExitCode).toBe(0);
  });

  it('does not log any failure symbols', async () => {
    makeAllFilesExist();
    await runDoctor();
    const allLogs = (console.log as jest.Mock).mock.calls.flat().join('\n');
    expect(allLogs).not.toMatch(/✖/);
  });
});

// ── Missing package.json ──────────────────────────────────────────────────────

describe('doctor — missing package.json', () => {
  it('exits with code 2', async () => {
    mockFs.existsSync.mockReturnValue(false);
    (mockFs.readFileSync as jest.Mock).mockReturnValue('');
    mockResolveApiKey.mockReturnValue(null);
    await runDoctor();
    expect(firstExitCode).toBe(2);
  });
});

// ── Missing .env ──────────────────────────────────────────────────────────────

describe('doctor — missing .env', () => {
  it('exits with code 2', async () => {
    mockFs.existsSync.mockImplementation((p) => {
      const s = String(p);
      return !s.endsWith('.env') && (
        s.endsWith('package.json') || s.endsWith('jest.config.js') || s.endsWith('tsconfig.json')
      );
    });
    (mockFs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ scripts: { test: 'jest' } }));
    mockResolveApiKey.mockReturnValue(null);
    await runDoctor();
    expect(firstExitCode).toBe(2);
  });
});

// ── No API key ────────────────────────────────────────────────────────────────

describe('doctor — no API key', () => {
  it('exits with code 2', async () => {
    makeAllFilesExist();
    mockResolveApiKey.mockReturnValue(null);
    await runDoctor();
    expect(firstExitCode).toBe(2);
  });
});

// ── API key from global config ────────────────────────────────────────────────

describe('doctor — API key from global config', () => {
  it('exits with code 0', async () => {
    makeAllFilesExist();
    mockResolveApiKey.mockReturnValue({ key: 'sk-from-config', source: 'config' });
    await runDoctor();
    expect(firstExitCode).toBe(0);
  });
});

// ── process.exit contract ─────────────────────────────────────────────────────

describe('doctor — process.exit contract', () => {
  it('always calls process.exit', async () => {
    makeAllFilesExist();
    await runDoctor();
    expect(firstExitCode).toBeDefined();
  });
});
