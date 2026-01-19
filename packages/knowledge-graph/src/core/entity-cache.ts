/**
 * Multi-key entity cache for flexible entity lookup
 *
 * Supports composite keys with fallback chains:
 * - entity:name:package:feature (most specific)
 * - entity:name:package
 * - entity:name:feature
 * - entity:name (least specific)
 *
 * Layer 1: Graph Primitives (generic)
 */

export type CacheKey = string;
export type CacheKeys = CacheKey | CacheKey[];
export type NodeId = number;

export class EntityCache {
  private cache: Map<CacheKey, NodeId>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Store an entity with multiple cache keys
   * @param keys - Array of cache keys (e.g., ['controller:SearchBox', 'controller:buildSearchBox'])
   * @param value - The value to cache (typically a node ID)
   */
  set(keys: CacheKeys, value: NodeId): void {
    const keyArray = Array.isArray(keys) ? keys : [keys];

    for (const key of keyArray) {
      this.cache.set(key, value);
    }
  }

  /**
   * Retrieve an entity, trying keys in order until found
   * @param keys - Single key or array of keys to try (most specific first)
   * @returns The cached value or undefined
   */
  get(keys: CacheKeys): NodeId | undefined {
    if (!Array.isArray(keys)) {
      return this.cache.get(keys);
    }

    // Try each key in order (most specific to least specific)
    for (const key of keys) {
      const value = this.cache.get(key);
      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Check if any of the keys exist
   * @param keys - Single key or array of keys
   * @returns True if any key exists
   */
  has(keys: CacheKeys): boolean {
    if (!Array.isArray(keys)) {
      return this.cache.has(keys);
    }

    return keys.some((key) => this.cache.has(key));
  }

  /**
   * Delete entries for all provided keys
   * @param keys - Single key or array of keys
   */
  delete(keys: CacheKeys): void {
    const keyArray = Array.isArray(keys) ? keys : [keys];

    for (const key of keyArray) {
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache
   * @returns The number of cached entries
   */
  get size(): number {
    return this.cache.size;
  }
}
