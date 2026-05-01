import {afterEach, describe, expect, it} from 'vitest';

import {resolveShardInfo} from '../src/reporter/shard-resolution.js';

const originalArgv = [...process.argv];

function withArgv(argv: string[]): void {
  process.argv = argv;
}

afterEach(() => {
  process.argv = [...originalArgv];
});

describe('resolveShardInfo', () => {
  it('returns shard info for a valid --shard value', () => {
    withArgv(['node', 'vitest', '--shard=2/4']);

    expect(resolveShardInfo()).toEqual({index: 2, total: 4});
  });

  it('returns null for invalid shard indices', () => {
    for (const shard of ['0/4', '5/4']) {
      withArgv(['node', 'vitest', '--shard', shard]);

      expect(resolveShardInfo()).toBeNull();
    }
  });

  it('returns null for invalid shard totals', () => {
    withArgv(['node', 'vitest', '--shard=1/0']);

    expect(resolveShardInfo()).toBeNull();
  });
});
