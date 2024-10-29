import {describe, it, expect} from 'vitest';
import {allocateShards} from './find-tests.mjs';

describe('allocateShards', () => {
  it('should allocate maximum shards when no tests to run', () => {
    const testToRun = '';
    const maximumShards = 5;
    const [shardIndex, shardTotal] = allocateShards(testToRun, maximumShards);
    expect(shardIndex).toEqual([1, 2, 3, 4, 5]);
    expect(shardTotal).toEqual([5]);
  });

  it('should allocate minimum shards when tests to run are less than maximum shards', () => {
    const testToRun = 'test1 test2';
    const maximumShards = 5;
    const [shardIndex, shardTotal] = allocateShards(testToRun, maximumShards);
    expect(shardIndex).toEqual([1, 2]);
    expect(shardTotal).toEqual([2]);
  });

  it('should allocate maximum shards when tests to run are more than maximum shards', () => {
    const testToRun = 'test1 test2 test3 test4 test5 test6';
    const maximumShards = 4;
    const [shardIndex, shardTotal] = allocateShards(testToRun, maximumShards);
    expect(shardIndex).toEqual([1, 2, 3, 4]);
    expect(shardTotal).toEqual([4]);
  });

  it('should allocate one shard when there is only one test to run', () => {
    const testToRun = 'test1';
    const maximumShards = 3;
    const [shardIndex, shardTotal] = allocateShards(testToRun, maximumShards);
    expect(shardIndex).toEqual([1]);
    expect(shardTotal).toEqual([1]);
  });
});
