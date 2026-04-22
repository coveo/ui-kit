// Gate script for Angular builds: Angular 20.x requires TypeScript <6.0.0.
// Exits with code 0 (skip) when TS >= 6, code 1 (proceed) otherwise.
// Usage: "node path/to/skip-if-ts6.mjs || ng build"
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const major = parseInt(ts.version);

if (major >= 6) {
  console.log(`Skipping: Angular requires TypeScript <6 (found ${ts.version})`);
  process.exit(0);
} else {
  process.exit(1);
}
