type MemoizeOptions = {
  /**
   * Maximum number of successful entries to keep in the cache.
   * When exceeded, the least recently used entry is evicted.
   */
  maxEntries?: number;
};

/**
 * Creates a memoized version of an async function with a custom cache key generator.
 * Only successful results are cached - rejected promises are not remembered.
 * Uses an LRU eviction strategy when `maxEntries` is set.
 *
 * @param fn - The async function to memoize
 * @param getCacheKey - A function that generates a unique cache key from the received `fn` function arguments
 * @param options - Optional cache configuration
 * @returns Object with the memoized function and cache clearing capability
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  getCacheKey: (...args: TArgs) => string,
  options: MemoizeOptions = {}
) {
  const cache = new Map<string, Promise<TReturn>>();
  const {maxEntries} = options;

  return {
    fn: async (...args: TArgs): Promise<TReturn> => {
      const key = getCacheKey(...args);

      if (cache.has(key)) {
        const cachedPromise = cache.get(key)!;
        cache.delete(key);
        cache.set(key, cachedPromise);
        return cachedPromise;
      }

      const promise = fn(...args).catch((error) => {
        cache.delete(key);
        throw error;
      });
      cache.set(key, promise);

      if (maxEntries !== undefined && cache.size > maxEntries) {
        const lruKey = cache.keys().next().value;
        if (lruKey !== undefined) {
          cache.delete(lruKey);
        }
      }

      return promise;
    },
    clearCache: (): void => {
      cache.clear();
    },
  };
}
