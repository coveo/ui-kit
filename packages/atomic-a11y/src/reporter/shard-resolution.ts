export interface ShardInfo {
  index: number;
  total: number;
}

export function parseShardDescriptor(
  descriptor: string | undefined
): ShardInfo | null {
  if (!descriptor) {
    return null;
  }

  const shardMatch = descriptor.match(/^(\d+)\/(\d+)$/);
  if (!shardMatch) {
    return null;
  }

  const [, rawIndex, rawTotal] = shardMatch;
  const index = Number.parseInt(rawIndex, 10);
  const total = Number.parseInt(rawTotal, 10);

  if (Number.isNaN(index) || Number.isNaN(total) || total <= 0) {
    return null;
  }

  return {index, total};
}

export function extractCliShardDescriptor(argv: string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument.startsWith('--shard=')) {
      return argument.slice('--shard='.length);
    }

    if (argument === '--shard') {
      return argv[index + 1];
    }
  }

  return undefined;
}

export function resolveShardInfo(): ShardInfo | null {
  return parseShardDescriptor(extractCliShardDescriptor(process.argv));
}
