import fs from 'fs';
import os from 'os';
import path from 'path';

export interface FastestConfig {
  openaiApiKey?: string;
  openaiModel?: string;
}

function getConfigDir(): string {
  return process.env.FASTEST_CONFIG_DIR ?? path.join(os.homedir(), '.fastest');
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function readConfig(): FastestConfig {
  const file = getConfigPath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as FastestConfig;
  } catch {
    return {};
  }
}

export function writeConfig(config: FastestConfig): void {
  const dir = getConfigDir();
  const file = getConfigPath();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(config, null, 2), { encoding: 'utf-8', mode: 0o600 });
}

export function clearConfig(): void {
  const file = getConfigPath();
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

/**
 * Resolves the OpenAI API key from all available sources in priority order:
 *   1. Explicit value passed by caller (e.g. --api-key flag)
 *   2. OPENAI_API_KEY environment variable (includes values loaded from .env)
 *   3. openaiApiKey stored in ~/.fastest/config.json (or FASTEST_CONFIG_DIR)
 */
export function resolveApiKey(explicit?: string): { key: string; source: 'option' | 'env' | 'config' } | null {
  if (explicit) return { key: explicit, source: 'option' };
  if (process.env.OPENAI_API_KEY) return { key: process.env.OPENAI_API_KEY, source: 'env' };
  const stored = readConfig().openaiApiKey;
  if (stored) return { key: stored, source: 'config' };
  return null;
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}
