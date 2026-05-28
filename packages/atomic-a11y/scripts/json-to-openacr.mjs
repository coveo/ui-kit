import {readFile} from 'node:fs/promises';
import {transformJsonToOpenAcr} from '../dist/index.js';

const pkg = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
);

await transformJsonToOpenAcr({version: pkg.version});
