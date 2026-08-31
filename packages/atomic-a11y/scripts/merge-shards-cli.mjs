import path from 'node:path';
import {mergeA11yShardReports} from '../dist/index.js';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const expectedShardsArg = args.find((arg) => arg.startsWith('--expected-shards='))?.split('=')[1];

const outputFile = positional[0] ?? path.resolve('reports', 'a11y-report.json');
const expectedShards = expectedShardsArg ? Number.parseInt(expectedShardsArg, 10) : undefined;

if (expectedShardsArg && !Number.isInteger(expectedShards)) {
  console.error(
    `[merge-shards] --expected-shards must be an integer, received "${expectedShardsArg}".`
  );
  process.exit(1);
}

const merged = await mergeA11yShardReports({outputFile, expectedShards});

if (!merged && expectedShards !== undefined) {
  console.error('[merge-shards] No merged report was produced.');
  process.exit(1);
}
