import fs from 'fs';
import path from 'path';
import os from 'os';
import { CacheService } from '../src/services/cache.service';

describe('CacheService', () => {
  let cacheDir: string;
  let cache: CacheService;

  beforeEach(() => {
    cacheDir = path.join(os.tmpdir(), `fastest-cache-test-${Date.now()}`);
    cache = new CacheService(cacheDir, 1);
  });

  afterEach(() => {
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true });
    }
  });

  it('returns undefined for cache miss', () => {
    expect(cache.get('prompt', 'model')).toBeUndefined();
  });

  it('returns cached response for cache hit', () => {
    cache.set('prompt', 'model', 'response');
    expect(cache.get('prompt', 'model')).toBe('response');
  });

  it('returns undefined for expired entries', () => {
    cache = new CacheService(cacheDir, 0); // 0 hours TTL
    cache.set('prompt', 'model', 'response');
    // Manually expire by modifying timestamp
    const files = fs.readdirSync(cacheDir);
    const entry = JSON.parse(fs.readFileSync(path.join(cacheDir, files[0]), 'utf-8'));
    entry.timestamp = Date.now() - 1000;
    fs.writeFileSync(path.join(cacheDir, files[0]), JSON.stringify(entry));
    expect(cache.get('prompt', 'model')).toBeUndefined();
  });

  it('clears all entries', () => {
    cache.set('p1', 'model', 'r1');
    cache.set('p2', 'model', 'r2');
    const count = cache.clear();
    expect(count).toBe(2);
    expect(cache.get('p1', 'model')).toBeUndefined();
  });

  it('reports stats correctly', () => {
    cache.set('p1', 'model', 'r1');
    const stats = cache.stats();
    expect(stats.entries).toBe(1);
    expect(stats.sizeBytes).toBeGreaterThan(0);
  });

  it('stats returns zeros for empty cache', () => {
    const stats = cache.stats();
    expect(stats.entries).toBe(0);
    expect(stats.sizeBytes).toBe(0);
  });

  it('different models produce different cache keys', () => {
    cache.set('prompt', 'model-a', 'response-a');
    cache.set('prompt', 'model-b', 'response-b');
    expect(cache.get('prompt', 'model-a')).toBe('response-a');
    expect(cache.get('prompt', 'model-b')).toBe('response-b');
  });
});
