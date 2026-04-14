import {beforeEach, describe, expect, it, vi} from 'vitest';
import {memoize} from './memoize';

describe('memoize', () => {
  let mockFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFn = vi.fn();
  });

  it('should cache results and not call function again for same cache key', async () => {
    mockFn.mockResolvedValue('cached result');
    const memoized = memoize(mockFn, (arg: string) => arg);

    const result1 = await memoized.fn('test');
    expect(result1).toBe('cached result');
    expect(mockFn).toHaveBeenCalledTimes(1);

    mockFn.mockResolvedValue('new result');

    const result2 = await memoized.fn('test');
    expect(result2).toBe('cached result');
    expect(mockFn).toHaveBeenCalledTimes(1);

    const result3 = await memoized.fn('different');
    expect(result3).toBe('new result');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should use custom cache key function', async () => {
    mockFn.mockResolvedValue('result');

    const memoized = memoize(mockFn, (a: string, _b: number) => a);

    const result1 = await memoized.fn('test', 123);
    expect(result1).toBe('result');

    const result2 = await memoized.fn('test', 999);
    expect(result2).toBe('result');

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should not cache rejected promises and allow retry', async () => {
    const error = new Error('test error');
    mockFn.mockRejectedValue(error);
    const memoized = memoize(mockFn, (arg: string) => arg);

    await expect(memoized.fn('test')).rejects.toThrow('test error');
    expect(mockFn).toHaveBeenCalledTimes(1);

    await expect(memoized.fn('test')).rejects.toThrow('test error');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should clear cache and allow fresh calls', async () => {
    mockFn.mockResolvedValue('result');
    const memoized = memoize(mockFn, (arg: string) => arg);

    const result1 = await memoized.fn('test');
    expect(result1).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);

    memoized.clearCache();

    mockFn.mockResolvedValue('result2');
    const result2 = await memoized.fn('test');
    expect(result2).toBe('result2');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should allow failed calls to be retried and eventually succeed', async () => {
    const error = new Error('temporary error');
    mockFn
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const memoized = memoize(mockFn, (arg: string) => arg);

    await expect(memoized.fn('test')).rejects.toThrow('temporary error');
    expect(mockFn).toHaveBeenCalledTimes(1);

    await expect(memoized.fn('test')).rejects.toThrow('temporary error');
    expect(mockFn).toHaveBeenCalledTimes(2);

    const result = await memoized.fn('test');
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);

    const result2 = await memoized.fn('test');
    expect(result2).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  describe('LRU eviction', () => {
    it('should evict the least recently used entry when maxEntries is exceeded', async () => {
      mockFn.mockImplementation((arg: string) =>
        Promise.resolve(`result-${arg}`)
      );
      const memoized = memoize(mockFn, (arg: string) => arg, {maxEntries: 2});

      await memoized.fn('a');
      await memoized.fn('b');
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Adding 'c' evicts 'a' (least recently used), cache: {b, c}
      await memoized.fn('c');
      expect(mockFn).toHaveBeenCalledTimes(3);

      mockFn.mockImplementation((arg: string) =>
        Promise.resolve(`fresh-${arg}`)
      );

      // 'b' and 'c' are still cached - no additional calls
      const resultB = await memoized.fn('b');
      expect(resultB).toBe('result-b');
      const resultC = await memoized.fn('c');
      expect(resultC).toBe('result-c');
      expect(mockFn).toHaveBeenCalledTimes(3);

      // 'a' was evicted when 'c' was added (LRU), so it should re-fetch
      const resultA = await memoized.fn('a');
      expect(resultA).toBe('fresh-a');
      expect(mockFn).toHaveBeenCalledTimes(4);
    });

    it('should promote a cache hit to most recently used', async () => {
      mockFn.mockImplementation((arg: string) =>
        Promise.resolve(`result-${arg}`)
      );
      const memoized = memoize(mockFn, (arg: string) => arg, {maxEntries: 2});

      await memoized.fn('a');
      await memoized.fn('b');

      await memoized.fn('a');

      mockFn.mockImplementation((arg: string) =>
        Promise.resolve(`fresh-${arg}`)
      );

      await memoized.fn('c');

      const resultA = await memoized.fn('a');
      expect(resultA).toBe('result-a');

      const resultB = await memoized.fn('b');
      expect(resultB).toBe('fresh-b');
    });
  });
});
