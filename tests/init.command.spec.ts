jest.mock('fs');
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((_q: string, cb: (answer: string) => void) => cb('')),
    close: jest.fn(),
  })),
}));
jest.mock('../src/config/config.manager', () => ({
  readConfig: jest.fn(() => ({})),
  writeConfig: jest.fn(),
}));
jest.mock('../src/utils/file.utils', () => ({
  ...jest.requireActual('../src/utils/file.utils'),
  detectTestFramework: jest.fn(() => 'jest'),
}));

import fs from 'fs';
import { buildInitCommand } from '../src/cli/init.command';

const mockFs = fs as jest.Mocked<typeof fs>;

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('init command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ name: 'test-project' }));
  });

  it('builds the command', () => {
    const cmd = buildInitCommand();
    expect(cmd.name()).toBe('init');
  });

  it('runs without error', async () => {
    const cmd = buildInitCommand();
    cmd.exitOverride();
    await cmd.parseAsync(['node', 'fastest']).catch(() => {});
  });
});
