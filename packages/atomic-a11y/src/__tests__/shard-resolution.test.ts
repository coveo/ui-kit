import {afterEach, describe, expect, it} from 'vitest';
import {resolveShardInfo} from '../reporter/shard-resolution.js';

describe('resolveShardInfo()', () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should return ShardInfo when process.argv contains --shard=1/3', () => {
    process.argv = ['node', 'vitest', '--shard=1/3'];
    const result = resolveShardInfo();
    expect(result).toEqual({index: 1, total: 3});
  });

  it('should return ShardInfo when process.argv contains --shard with space', () => {
    process.argv = ['node', 'vitest', '--shard', '2/4'];
    const result = resolveShardInfo();
    expect(result).toEqual({index: 2, total: 4});
  });

  it('should return null when no --shard in process.argv', () => {
    process.argv = ['node', 'vitest', '--run'];
    const result = resolveShardInfo();
    expect(result).toBeNull();
  });

  it('should return null when process.argv contains invalid shard descriptor', () => {
    process.argv = ['node', 'vitest', '--shard=invalid'];
    const result = resolveShardInfo();
    expect(result).toBeNull();
  });

  it('should return null when --shard has zero total', () => {
    process.argv = ['node', 'vitest', '--shard=1/0'];
    const result = resolveShardInfo();
    expect(result).toBeNull();
  });

  it('should properly restore process.argv after test', () => {
    const testArgv = ['node', 'vitest', '--shard=1/2'];
    process.argv = testArgv;
    resolveShardInfo();
    expect(process.argv).toBe(testArgv);
  });
});
