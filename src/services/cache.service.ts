import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CacheEntry {
  prompt: string;
  response: string;
  model: string;
  timestamp: number;
}

export class CacheService {
  private readonly cacheDir: string;
  private readonly ttlMs: number;

  constructor(cacheDir?: string, ttlHours: number = 24) {
    this.cacheDir = cacheDir ?? path.join(
      process.env.FASTEST_CONFIG_DIR ?? path.join(require('os').homedir(), '.fastest'),
      'cache',
    );
    this.ttlMs = ttlHours * 60 * 60 * 1000;
  }

  private hashKey(prompt: string, model: string): string {
    return crypto.createHash('sha256').update(`${model}:${prompt}`).digest('hex');
  }

  private entryPath(hash: string): string {
    return path.join(this.cacheDir, `${hash}.json`);
  }

  get(prompt: string, model: string): string | undefined {
    const hash = this.hashKey(prompt, model);
    const filePath = this.entryPath(hash);

    if (!fs.existsSync(filePath)) return undefined;

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(raw);

      if (Date.now() - entry.timestamp > this.ttlMs) {
        fs.unlinkSync(filePath);
        return undefined;
      }

      return entry.response;
    } catch {
      return undefined;
    }
  }

  set(prompt: string, model: string, response: string): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    const hash = this.hashKey(prompt, model);
    const entry: CacheEntry = {
      prompt: prompt.slice(0, 200),
      response,
      model,
      timestamp: Date.now(),
    };

    fs.writeFileSync(this.entryPath(hash), JSON.stringify(entry), 'utf-8');
  }

  clear(): number {
    if (!fs.existsSync(this.cacheDir)) return 0;
    const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      fs.unlinkSync(path.join(this.cacheDir, file));
    }
    return files.length;
  }

  stats(): { entries: number; sizeBytes: number } {
    if (!fs.existsSync(this.cacheDir)) return { entries: 0, sizeBytes: 0 };
    const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
    let sizeBytes = 0;
    for (const file of files) {
      sizeBytes += fs.statSync(path.join(this.cacheDir, file)).size;
    }
    return { entries: files.length, sizeBytes };
  }
}
