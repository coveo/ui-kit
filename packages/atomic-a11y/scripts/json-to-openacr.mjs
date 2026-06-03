import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {transformJsonToOpenAcr} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await transformJsonToOpenAcr({
  inputFile: path.resolve(__dirname, '../../atomic/reports/a11y-report.json'),
});
