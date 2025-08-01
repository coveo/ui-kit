import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
// Read the version from package.json
import {fileURLToPath} from 'node:url';
import coreVersionTransformer from '../../../scripts/version-transform.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageJsonPath = resolve(__dirname, '../package.json');
const {version} = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

/**
 * Custom transformer to replace process.env.VERSION with the actual version from package.json.
 */
export default function versionTransformer(context) {
  return coreVersionTransformer(context, version);
}
