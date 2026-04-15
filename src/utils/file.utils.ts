import fs from 'fs';
import path from 'path';

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
