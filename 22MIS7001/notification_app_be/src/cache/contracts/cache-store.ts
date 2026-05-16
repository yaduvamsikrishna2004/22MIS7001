export interface CacheSetOptions {
  ttlSeconds: number;
}

export interface CacheStore {
  get<TValue>(key: string): Promise<TValue | null>;
  set<TValue>(key: string, value: TValue, options: CacheSetOptions): Promise<void>;
  del(key: string): Promise<void>;
  increment(key: string, amount: number, options?: CacheSetOptions): Promise<number>;
}
