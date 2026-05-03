import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Provider } from '../providers/provider.interface';

export interface FastestConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  openaiModel?: string;
}

export type { Provider };

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

export type KeySource = 'option' | 'env' | 'config';

const ENV_KEY: Record<Provider, string> = {
  openai:    'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

const CONFIG_KEY: Record<Provider, keyof FastestConfig> = {
  openai:    'openaiApiKey',
  anthropic: 'anthropicApiKey',
};

export function resolveApiKeyForProvider(
  provider: Provider,
  explicit?: string,
): { key: string; source: KeySource } | null {
  if (explicit) return { key: explicit, source: 'option' };
  const envVal = process.env[ENV_KEY[provider]];
  if (envVal) return { key: envVal, source: 'env' };
  const stored = readConfig()[CONFIG_KEY[provider]];
  if (stored) return { key: stored, source: 'config' };
  return null;
}

export function resolveApiKey(explicit?: string): { key: string; source: KeySource } | null {
  return resolveApiKeyForProvider('openai', explicit);
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}
