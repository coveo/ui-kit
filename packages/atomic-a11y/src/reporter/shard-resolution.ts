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
  const byDescriptor = [
    process.env.A11Y_REPORT_SHARD,
    process.env.VITEST_SHARD,
    extractCliShardDescriptor(process.argv),
  ]
    .map((descriptor) => parseShardDescriptor(descriptor))
    .find((parsed): parsed is ShardInfo => parsed !== null);

  if (byDescriptor) {
    return byDescriptor;
  }

  const rawIndex =
    process.env.CI_NODE_INDEX ??
    process.env.CIRCLE_NODE_INDEX ??
    process.env.BUILDKITE_PARALLEL_JOB;
  const rawTotal =
    process.env.CI_NODE_TOTAL ??
    process.env.CIRCLE_NODE_TOTAL ??
    process.env.BUILDKITE_PARALLEL_JOB_COUNT;

  if (!rawIndex || !rawTotal) {
    return null;
  }

  const parsedIndex = Number.parseInt(rawIndex, 10);
  const parsedTotal = Number.parseInt(rawTotal, 10);

  if (
    Number.isNaN(parsedIndex) ||
    Number.isNaN(parsedTotal) ||
    parsedTotal <= 0
  ) {
    return null;
  }

  const normalizedIndex =
    parsedIndex >= 1 && parsedIndex <= parsedTotal
      ? parsedIndex
      : parsedIndex >= 0 && parsedIndex < parsedTotal
        ? parsedIndex + 1
        : parsedIndex;

  if (normalizedIndex < 1 || normalizedIndex > parsedTotal) {
    return null;
  }

  return {
    index: normalizedIndex,
    total: parsedTotal,
  };
}
