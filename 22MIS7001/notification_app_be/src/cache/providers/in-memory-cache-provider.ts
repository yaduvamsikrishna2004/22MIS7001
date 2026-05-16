import type { CacheSetOptions, CacheStore } from '../contracts/cache-store.js';

interface CacheEntry {
  rawValue: unknown;
  expiresAtEpochMs: number;
}

const isExpired = (entry: CacheEntry): boolean => {
  return Date.now() >= entry.expiresAtEpochMs;
};

export class InMemoryCacheProvider implements CacheStore {
  private readonly store = new Map<string, CacheEntry>();

  public async get<TValue>(key: string): Promise<TValue | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    return entry.rawValue as TValue;
  }

  public async set<TValue>(key: string, value: TValue, options: CacheSetOptions): Promise<void> {
    const expiresAtEpochMs = Date.now() + options.ttlSeconds * 1000;
    this.store.set(key, {
      rawValue: value,
      expiresAtEpochMs
    });
  }

  public async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async increment(
    key: string,
    amount: number,
    options?: CacheSetOptions
  ): Promise<number> {
    const currentValue = (await this.get<number>(key)) ?? 0;
    const nextValue = currentValue + amount;

    if (options) {
      await this.set(key, nextValue, options);
    } else {
      await this.set(key, nextValue, { ttlSeconds: 60 });
    }

    return nextValue;
  }
}
