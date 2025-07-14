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

  it('should clear specific cache entries', async () => {
    mockFn.mockResolvedValue('result');
    const memoized = memoize(mockFn, (arg: string) => arg);

    await memoized.fn('test1');
    await memoized.fn('test2');
    expect(mockFn).toHaveBeenCalledTimes(2);

    await memoized.fn('test1');
    await memoized.fn('test2');
    expect(mockFn).toHaveBeenCalledTimes(2);

    memoized.clearCacheEntry('test1');

    mockFn.mockResolvedValue('new-result');
    const result1 = await memoized.fn('test1');
    const result2 = await memoized.fn('test2');

    expect(result1).toBe('new-result');
    expect(result2).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
