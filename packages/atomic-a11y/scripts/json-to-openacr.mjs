import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {transformJsonToOpenAcr} from '../dist/index.js';
import {formatWithOxfmt} from './format-with-oxfmt.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputFile = path.resolve(__dirname, '../reports/openacr.yaml');
await transformJsonToOpenAcr({
  inputFile: path.resolve(__dirname, '../../atomic/reports/a11y-report.json'),
  outputFile,
});
formatWithOxfmt(outputFile);
