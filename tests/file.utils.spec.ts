import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  readFile,
  writeFile,
  getBaseName,
  stripCodeFences,
  buildPromptContextFromPaths,
} from '../src/utils/file.utils';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fastest-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ── readFile ──────────────────────────────────────────────────────────────────

describe('readFile', () => {
  it('returns file content', () => {
    const file = path.join(tmpDir, 'hello.ts');
    fs.writeFileSync(file, 'const x = 1;');
    expect(readFile(file)).toBe('const x = 1;');
  });

  it('throws when file does not exist', () => {
    expect(() => readFile(path.join(tmpDir, 'missing.ts'))).toThrow('File not found');
  });
});

// ── writeFile ─────────────────────────────────────────────────────────────────

describe('writeFile', () => {
  it('writes content to a new file', () => {
    const file = path.join(tmpDir, 'out.ts');
    writeFile(file, 'export {};');
    expect(fs.readFileSync(file, 'utf-8')).toBe('export {};');
  });

  it('creates intermediate directories', () => {
    const file = path.join(tmpDir, 'deep', 'nested', 'file.ts');
    writeFile(file, 'ok');
    expect(fs.existsSync(file)).toBe(true);
  });

  it('overwrites existing file', () => {
    const file = path.join(tmpDir, 'file.ts');
    writeFile(file, 'first');
    writeFile(file, 'second');
    expect(fs.readFileSync(file, 'utf-8')).toBe('second');
  });
});

// ── getBaseName ───────────────────────────────────────────────────────────────

describe('getBaseName', () => {
  it('strips extension from filename', () => {
    expect(getBaseName('src/utils/file.utils.ts')).toBe('file.utils');
  });

  it('handles file without extension', () => {
    expect(getBaseName('Makefile')).toBe('Makefile');
  });

  it('handles nested path', () => {
    expect(getBaseName('/a/b/c/my.service.ts')).toBe('my.service');
  });
});

// ── stripCodeFences ───────────────────────────────────────────────────────────

describe('stripCodeFences', () => {
  it('strips typescript fence', () => {
    const input = '```typescript\nconst x = 1;\n```';
    expect(stripCodeFences(input)).toBe('const x = 1;');
  });

  it('strips ts fence', () => {
    const input = '```ts\nconst x = 1;\n```';
    expect(stripCodeFences(input)).toBe('const x = 1;');
  });

  it('strips plain fence', () => {
    const input = '```\ncode\n```';
    expect(stripCodeFences(input)).toBe('code');
  });

  it('returns code unchanged when no fences present', () => {
    const input = 'const x = 1;';
    expect(stripCodeFences(input)).toBe('const x = 1;');
  });
});

// ── buildPromptContextFromPaths ───────────────────────────────────────────────

describe('buildPromptContextFromPaths', () => {
  it('returns empty result for empty input', () => {
    const result = buildPromptContextFromPaths([]);
    expect(result.promptContext).toBe('');
    expect(result.usedFiles).toHaveLength(0);
    expect(result.totalCharsIncluded).toBe(0);
  });

  it('includes a valid text file', () => {
    const file = path.join(tmpDir, 'ctx.ts');
    fs.writeFileSync(file, 'export const x = 1;');
    const result = buildPromptContextFromPaths([file], { baseDir: tmpDir });
    expect(result.usedFiles).toHaveLength(1);
    expect(result.promptContext).toContain('export const x = 1;');
    expect(result.totalCharsIncluded).toBeGreaterThan(0);
  });

  it('skips non-existent path', () => {
    const result = buildPromptContextFromPaths([path.join(tmpDir, 'ghost.ts')], { baseDir: tmpDir });
    expect(result.skippedInputs).toHaveLength(1);
    expect(result.usedFiles).toHaveLength(0);
  });

  it('skips files with disallowed extension', () => {
    const file = path.join(tmpDir, 'image.png');
    fs.writeFileSync(file, 'fake png');
    const result = buildPromptContextFromPaths([file], { baseDir: tmpDir });
    expect(result.skippedByExtensionFiles).toHaveLength(1);
    expect(result.usedFiles).toHaveLength(0);
  });

  it('truncates file content when it exceeds maxCharsPerFile', () => {
    const file = path.join(tmpDir, 'big.ts');
    fs.writeFileSync(file, 'x'.repeat(200));
    const result = buildPromptContextFromPaths([file], { baseDir: tmpDir, maxCharsPerFile: 50 });
    expect(result.truncatedFiles).toHaveLength(1);
    expect(result.totalCharsIncluded).toBeLessThanOrEqual(200);
  });

  it('respects maxFiles limit', () => {
    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(tmpDir, `f${i}.ts`), `const v${i} = ${i};`);
    }
    const result = buildPromptContextFromPaths([tmpDir], { baseDir: tmpDir, maxFiles: 3 });
    expect(result.limitedByMaxFiles).toBe(true);
    expect(result.usedFiles.length).toBeLessThanOrEqual(3);
  });

  it('walks directory recursively', () => {
    const sub = path.join(tmpDir, 'sub');
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, 'nested.ts'), 'const n = true;');
    const result = buildPromptContextFromPaths([tmpDir], { baseDir: tmpDir });
    expect(result.usedFiles.some(f => f.includes('nested.ts'))).toBe(true);
  });

  it('stops when maxTotalChars is reached', () => {
    for (let i = 0; i < 3; i++) {
      fs.writeFileSync(path.join(tmpDir, `file${i}.ts`), 'x'.repeat(100));
    }
    const result = buildPromptContextFromPaths([tmpDir], { baseDir: tmpDir, maxTotalChars: 150 });
    expect(result.limitedByMaxTotalChars).toBe(true);
    expect(result.totalCharsIncluded).toBeLessThanOrEqual(200);
  });
});
