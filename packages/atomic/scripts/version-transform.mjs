import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
// Read the version from package.json
import {fileURLToPath} from 'node:url';
import coreVersionTransformer from '../../../scripts/version-transform.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageJsonPath = resolve(__dirname, '../package.json');
const {version} = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const headlessPackageJsonPath = resolve(
  __dirname,
  '../../headless/package.json'
);
const headlessVersion = JSON.parse(
  readFileSync(headlessPackageJsonPath, 'utf8')
).version;

/**
 * Custom transformer to replace process.env.VERSION with the actual version from package.json.
 */
export default [
  function atomicVersionTransformers(context) {
    return coreVersionTransformer(context, version, 'VERSION');
  },
  function headlessVersionTransformers(context) {
    return coreVersionTransformer(context, headlessVersion, 'HEADLESS_VERSION');
  },
];
