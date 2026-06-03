import path from 'node:path';
import {mergeA11yShardReports} from '../dist/index.js';

const outputFile =
  process.argv[2] ?? path.resolve('reports', 'a11y-report.json');

await mergeA11yShardReports({outputFile});
