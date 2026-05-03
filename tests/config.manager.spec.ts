import fs from 'fs';
import os from 'os';
import path from 'path';

// Point the config manager at a temp dir so tests never touch the real ~/.fastest
const testConfigDir = path.join(os.tmpdir(), `fastest-test-config-${process.pid}`);
const testConfigFile = path.join(testConfigDir, 'config.json');

beforeAll(() => {
  process.env.FASTEST_CONFIG_DIR = testConfigDir;
});

beforeEach(() => {
  if (fs.existsSync(testConfigDir)) fs.rmSync(testConfigDir, { recursive: true });
  delete process.env.OPENAI_API_KEY;
});

afterAll(() => {
  if (fs.existsSync(testConfigDir)) fs.rmSync(testConfigDir, { recursive: true });
  delete process.env.FASTEST_CONFIG_DIR;
});

import {
  readConfig,
  writeConfig,
  clearConfig,
  resolveApiKey,
  maskKey,
  getConfigPath,
} from '../src/config/config.manager';

// ── readConfig ────────────────────────────────────────────────────────────────

describe('readConfig', () => {
  it('returns empty object when config file does not exist', () => {
    expect(readConfig()).toEqual({});
  });

  it('parses config file when it exists', () => {
    fs.mkdirSync(testConfigDir, { recursive: true });
    fs.writeFileSync(testConfigFile, JSON.stringify({ openaiApiKey: 'sk-test' }));
    expect(readConfig().openaiApiKey).toBe('sk-test');
  });

  it('returns empty object when config file is malformed JSON', () => {
    fs.mkdirSync(testConfigDir, { recursive: true });
    fs.writeFileSync(testConfigFile, 'not-json');
    expect(readConfig()).toEqual({});
  });
});

// ── writeConfig ───────────────────────────────────────────────────────────────

describe('writeConfig', () => {
  it('creates config directory if it does not exist', () => {
    writeConfig({ openaiApiKey: 'sk-abc' });
    expect(fs.existsSync(testConfigFile)).toBe(true);
  });

  it('persists key and model and can be read back', () => {
    writeConfig({ openaiApiKey: 'sk-abc', openaiModel: 'gpt-4o' });
    const config = readConfig();
    expect(config.openaiApiKey).toBe('sk-abc');
    expect(config.openaiModel).toBe('gpt-4o');
  });

  it('overwrites existing config', () => {
    writeConfig({ openaiApiKey: 'sk-first' });
    writeConfig({ openaiApiKey: 'sk-second' });
    expect(readConfig().openaiApiKey).toBe('sk-second');
  });
});

// ── clearConfig ───────────────────────────────────────────────────────────────

describe('clearConfig', () => {
  it('removes the config file', () => {
    writeConfig({ openaiApiKey: 'sk-abc' });
    clearConfig();
    expect(fs.existsSync(testConfigFile)).toBe(false);
  });

  it('does nothing when config file does not exist', () => {
    expect(() => clearConfig()).not.toThrow();
  });
});

// ── resolveApiKey ─────────────────────────────────────────────────────────────

describe('resolveApiKey', () => {
  it('returns null when no key is available from any source', () => {
    expect(resolveApiKey()).toBeNull();
  });

  it('returns key from explicit option with source=option', () => {
    const result = resolveApiKey('sk-explicit');
    expect(result?.key).toBe('sk-explicit');
    expect(result?.source).toBe('option');
  });

  it('returns key from env var with source=env', () => {
    process.env.OPENAI_API_KEY = 'sk-env';
    const result = resolveApiKey();
    expect(result?.key).toBe('sk-env');
    expect(result?.source).toBe('env');
  });

  it('returns key from global config with source=config', () => {
    writeConfig({ openaiApiKey: 'sk-stored' });
    const result = resolveApiKey();
    expect(result?.key).toBe('sk-stored');
    expect(result?.source).toBe('config');
  });

  it('explicit option takes priority over env var', () => {
    process.env.OPENAI_API_KEY = 'sk-env';
    const result = resolveApiKey('sk-explicit');
    expect(result?.source).toBe('option');
    expect(result?.key).toBe('sk-explicit');
  });

  it('env var takes priority over global config', () => {
    writeConfig({ openaiApiKey: 'sk-stored' });
    process.env.OPENAI_API_KEY = 'sk-env';
    const result = resolveApiKey();
    expect(result?.source).toBe('env');
    expect(result?.key).toBe('sk-env');
  });
});

// ── maskKey ───────────────────────────────────────────────────────────────────

describe('maskKey', () => {
  it('masks a standard key showing first 7 and last 4 chars', () => {
    const masked = maskKey('sk-proj-abcdef1234');
    expect(masked).toContain('sk-proj');
    expect(masked).toContain('1234');
    expect(masked).toContain('...');
  });

  it('returns **** for very short keys', () => {
    expect(maskKey('short')).toBe('****');
  });
});

// ── getConfigPath ─────────────────────────────────────────────────────────────

describe('getConfigPath', () => {
  it('uses FASTEST_CONFIG_DIR when set', () => {
    expect(getConfigPath()).toBe(testConfigFile);
  });
});
