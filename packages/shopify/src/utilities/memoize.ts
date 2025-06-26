/**
 * Creates a memoized version of an async function with a custom cache key generator.
 * Only successful results are cached - rejected promises are not remembered.
 *
 * @param fn - The async function to memoize
 * @param getCacheKey - Function that generates a cache key from the function arguments
 * @returns Object with the memoized function and cache clearing capability
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  getCacheKey: (...args: TArgs) => string
) {
  const cache = new Map<string, Promise<TReturn>>();

  return {
    fn: async (...args: TArgs): Promise<TReturn> => {
      const key = getCacheKey(...args);

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const promise = fn(...args);
      cache.set(key, promise);

      try {
        const result = await promise;
        return result;
      } catch (error) {
        // Remove failed promises from cache so they can be retried
        cache.delete(key);
        throw error;
      }
    },
    clearCache: (): void => {
      cache.clear();
    },
    clearCacheEntry: (...args: TArgs): void => {
      const key = getCacheKey(...args);
      cache.delete(key);
    },
  };
}
