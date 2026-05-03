import fs from 'fs';
import path from 'path';

export interface PromptContextResult {
  promptContext: string;
  usedFiles: string[];
  skippedInputs: string[];
  truncatedFiles: string[];
  skippedBinaryFiles: string[];
  skippedByExtensionFiles: string[];
  limitedByMaxFiles: boolean;
  limitedByMaxTotalChars: boolean;
  totalCharsIncluded: number;
}

export interface PromptContextOptions {
  baseDir?: string;
  maxFiles?: number;
  maxCharsPerFile?: number;
  maxTotalChars?: number;
  allowedExtensions?: string[];
}

const DEFAULT_ALLOWED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.yml', '.yaml', '.toml', '.ini',
  '.md', '.mdx', '.txt', '.graphql', '.gql',
  '.sql', '.sh', '.ps1', '.bat', '.cmd', '.env',
  '.css', '.scss', '.html', '.xml', '.properties',
]);

const DEFAULT_ALLOWED_FILENAMES = new Set([
  'dockerfile',
  'makefile',
  'readme',
  'readme.md',
  '.env',
  '.env.example',
]);

/**
 * Reads the content of a file and returns it as a string.
 */
export function readFile(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf-8');
}

/**
 * Writes content to a file, creating intermediate directories as needed.
 */
export function writeFile(filePath: string, content: string): void {
  const absolutePath = path.resolve(filePath);
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(absolutePath, content, 'utf-8');
}

/**
 * Returns the base name (without extension) of a file path.
 */
export function getBaseName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Strips markdown code fences (e.g. ```typescript ... ```) from a string.
 */
export function stripCodeFences(content: string): string {
  return content
    .replace(/^```(?:typescript|ts|javascript|js)?\n?/im, '')
    .replace(/\n?```$/im, '')
    .trim();
}

/**
 * Collects extra context from file/folder paths and formats it for prompt injection.
 */
export function buildPromptContextFromPaths(
  inputPaths: string[] = [],
  options: PromptContextOptions = {},
): PromptContextResult {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const maxFiles = options.maxFiles ?? 20;
  const maxCharsPerFile = options.maxCharsPerFile ?? 4000;
  const maxTotalChars = options.maxTotalChars ?? 30000;
  const allowedExtensions = new Set(
    (options.allowedExtensions ?? Array.from(DEFAULT_ALLOWED_EXTENSIONS)).map((x) => x.toLowerCase()),
  );

  if (inputPaths.length === 0) {
    return {
      promptContext: '',
      usedFiles: [],
      skippedInputs: [],
      truncatedFiles: [],
      skippedBinaryFiles: [],
      skippedByExtensionFiles: [],
      limitedByMaxFiles: false,
      limitedByMaxTotalChars: false,
      totalCharsIncluded: 0,
    };
  }

  const skippedInputs: string[] = [];
  const skippedBinaryFiles: string[] = [];
  const skippedByExtensionFiles: string[] = [];
  const collected = new Set<string>();

  for (const input of inputPaths) {
    const abs = path.resolve(baseDir, input);
    if (!fs.existsSync(abs)) {
      skippedInputs.push(input);
      continue;
    }

    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      collected.add(abs);
      continue;
    }

    if (stat.isDirectory()) {
      for (const file of walkDirectory(abs)) {
        collected.add(file);
      }
    }
  }

  const allCollected = Array.from(collected).sort();
  const limitedByMaxFiles = allCollected.length > maxFiles;
  const usedFiles = allCollected.slice(0, maxFiles);
  const truncatedFiles: string[] = [];
  const sections: string[] = [];
  let totalCharsIncluded = 0;
  let limitedByMaxTotalChars = false;

  for (const filePath of usedFiles) {
    try {
      const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath).toLowerCase();
      const extensionAllowed = allowedExtensions.has(ext);
      const filenameAllowed = DEFAULT_ALLOWED_FILENAMES.has(fileName);
      if (!extensionAllowed && !filenameAllowed) {
        skippedByExtensionFiles.push(rel);
        continue;
      }

      const rawBuffer = fs.readFileSync(filePath);
      if (isProbablyBinary(rawBuffer)) {
        skippedBinaryFiles.push(rel);
        continue;
      }

      const raw = rawBuffer.toString('utf-8');
      let content = raw;
      if (raw.length > maxCharsPerFile) {
        content = fitWithMarker(raw, maxCharsPerFile, '\n/* ... truncated ... */');
        truncatedFiles.push(rel);
      }

      if (totalCharsIncluded + content.length > maxTotalChars) {
        const remaining = maxTotalChars - totalCharsIncluded;
        if (remaining <= 0) {
          limitedByMaxTotalChars = true;
          break;
        }
        content = fitWithMarker(content, remaining, '\n/* ... truncated by total context limit ... */');
        if (!truncatedFiles.includes(rel)) {
          truncatedFiles.push(rel);
        }
        limitedByMaxTotalChars = true;
      }

      totalCharsIncluded += content.length;
      sections.push(`ARQUIVO: ${rel}\n${content}`);

      if (limitedByMaxTotalChars) {
        break;
      }
    } catch {
      skippedInputs.push(path.relative(baseDir, filePath));
    }
  }

  if (sections.length === 0) {
    return {
      promptContext: '',
      usedFiles: [],
      skippedInputs,
      truncatedFiles,
      skippedBinaryFiles,
      skippedByExtensionFiles,
      limitedByMaxFiles,
      limitedByMaxTotalChars,
      totalCharsIncluded,
    };
  }

  const promptContext = [
    'CONTEXTO ADICIONAL DO SISTEMA (arquivos/pastas fornecidos):',
    ...sections,
  ].join('\n\n');

  return {
    promptContext,
    usedFiles: usedFiles
      .map((f) => path.relative(baseDir, f).replace(/\\/g, '/'))
      .filter((f) => !skippedBinaryFiles.includes(f) && !skippedByExtensionFiles.includes(f)),
    skippedInputs,
    truncatedFiles,
    skippedBinaryFiles,
    skippedByExtensionFiles,
    limitedByMaxFiles,
    limitedByMaxTotalChars,
    totalCharsIncluded,
  };
}

function isProbablyBinary(buffer: Buffer): boolean {
  const sampleSize = Math.min(buffer.length, 1024);
  for (let i = 0; i < sampleSize; i += 1) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

function fitWithMarker(text: string, maxChars: number, marker: string): string {
  if (maxChars <= 0) {
    return '';
  }
  if (text.length <= maxChars) {
    return text;
  }
  if (marker.length >= maxChars) {
    return marker.slice(0, maxChars);
  }
  const sliceLen = maxChars - marker.length;
  return `${text.slice(0, sliceLen)}${marker}`;
}

function walkDirectory(dirPath: string): string[] {
  const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'coverage']);
  const result: string[] = [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      result.push(...walkDirectory(fullPath));
      continue;
    }
    if (entry.isFile()) {
      result.push(fullPath);
    }
  }

  return result;
}
