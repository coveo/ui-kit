export type CacheKey<T> = symbol & {__type: T};

export function createCacheKey<T>(description: string): CacheKey<T> {
  return Symbol(description) as CacheKey<T>;
}

export interface InterfaceCacheRegistryInternals {
  disposed: boolean;
}

export let getInterfaceCacheRegistryInternals: (
  registry: InterfaceCacheRegistry
) => InterfaceCacheRegistryInternals;

export class InterfaceCacheRegistry {
  get disposed(): boolean {
    return this.#disposed;
  }

  #entries = new Map<symbol, unknown>();
  #disposed = false;

  static {
    getInterfaceCacheRegistryInternals = <
      typeof getInterfaceCacheRegistryInternals
    >((registry) => ({
      disposed: registry.#disposed,
    }));
  }

  set<T>(key: CacheKey<T>, value: T): void {
    this.#assertNotDisposed();
    this.#entries.set(key, value);
  }

  get<T>(key: CacheKey<T>): T | undefined {
    this.#assertNotDisposed();
    return this.#entries.get(key) as T | undefined;
  }

  has(key: CacheKey<unknown>): boolean {
    this.#assertNotDisposed();
    return this.#entries.has(key);
  }

  getOrCreate<T>(key: CacheKey<T>, factory: () => T): T {
    this.#assertNotDisposed();
    const existing = this.#entries.get(key);
    if (existing !== undefined) {
      return existing as T;
    }
    const value = factory();
    this.#entries.set(key, value);
    return value;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#entries.clear();
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error(
        'Cannot access InterfaceCacheRegistry: the owning interface has been disposed.'
      );
    }
  }
}
