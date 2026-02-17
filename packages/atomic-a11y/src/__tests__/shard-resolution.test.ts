import {afterEach, describe, expect, it} from 'vitest';
import {
  extractCliShardDescriptor,
  parseShardDescriptor,
  resolveShardInfo,
} from '../reporter/shard-resolution.js';

describe('parseShardDescriptor()', () => {
  it('should parse valid shard descriptor "1/3"', () => {
    const result = parseShardDescriptor('1/3');
    expect(result).toEqual({index: 1, total: 3});
  });

  it('should parse valid shard descriptor "10/20"', () => {
    const result = parseShardDescriptor('10/20');
    expect(result).toEqual({index: 10, total: 20});
  });

  it('should parse valid shard descriptor "0/1"', () => {
    const result = parseShardDescriptor('0/1');
    expect(result).toEqual({index: 0, total: 1});
  });

  it('should return null for undefined descriptor', () => {
    const result = parseShardDescriptor(undefined);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = parseShardDescriptor('');
    expect(result).toBeNull();
  });

  it('should return null for invalid format "abc"', () => {
    const result = parseShardDescriptor('abc');
    expect(result).toBeNull();
  });

  it('should return null for incomplete format "1/"', () => {
    const result = parseShardDescriptor('1/');
    expect(result).toBeNull();
  });

  it('should return null for incomplete format "/3"', () => {
    const result = parseShardDescriptor('/3');
    expect(result).toBeNull();
  });

  it('should return null for total zero "1/0"', () => {
    const result = parseShardDescriptor('1/0');
    expect(result).toBeNull();
  });

  it('should return null for negative total "1/-3"', () => {
    const result = parseShardDescriptor('1/-3');
    expect(result).toBeNull();
  });

  it('should return null for format with extra spaces "1 / 3"', () => {
    const result = parseShardDescriptor('1 / 3');
    expect(result).toBeNull();
  });

  it('should return null for format with non-numeric characters "a/b"', () => {
    const result = parseShardDescriptor('a/b');
    expect(result).toBeNull();
  });
});

describe('extractCliShardDescriptor()', () => {
  it('should extract descriptor from --shard= format', () => {
    const argv = ['node', 'vitest', '--shard=1/3'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBe('1/3');
  });

  it('should extract descriptor from --shard with space separator', () => {
    const argv = ['node', 'vitest', '--shard', '2/4'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBe('2/4');
  });

  it('should return undefined when --shard is not present', () => {
    const argv = ['node', 'vitest', '--other-flag'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty argv', () => {
    const argv: string[] = [];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBeUndefined();
  });

  it('should extract first --shard occurrence when multiple exist', () => {
    const argv = ['node', 'vitest', '--shard=1/3', '--shard=2/3'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBe('1/3');
  });

  it('should return value after --shard flag at end of argv', () => {
    const argv = [
      'node',
      'vitest',
      '--config',
      'vitest.config.ts',
      '--shard',
      '3/5',
    ];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBe('3/5');
  });

  it('should return undefined when --shard is last argument with no value', () => {
    const argv = ['node', 'vitest', '--shard'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBeUndefined();
  });

  it('should extract descriptor from --shard= with large numbers', () => {
    const argv = ['node', 'vitest', '--shard=100/200'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBe('100/200');
  });

  it('should not match --shard-something differently', () => {
    const argv = ['node', 'vitest', '--shard-something=1/3'];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBeUndefined();
  });

  it('should handle multiple other flags', () => {
    const argv = [
      'node',
      'vitest',
      '--ui',
      '--run',
      '--shard=2/3',
      '--reporter=verbose',
    ];
    const result = extractCliShardDescriptor(argv);
    expect(result).toBe('2/3');
  });
});

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
