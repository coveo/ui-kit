/**
 * Reads .env (or OS environment variables) and generates src/environments/environment.ts.
 * Run before build: `node scripts/generate-env.mjs`
 */
import 'dotenv/config';
import {writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT, 'src/environments/environment.ts');

function get(key, fallback = '') {
  return process.env[key] || fallback;
}

const output = `// Auto-generated from .env — do not edit manually.
export const environment = {
  organizationId: ${JSON.stringify(get('COVEO_ORGANIZATION_ID'))},
  accessToken: ${JSON.stringify(get('COVEO_ACCESS_TOKEN'))},
  trackingId: ${JSON.stringify(get('COVEO_TRACKING_ID'))},
  language: ${JSON.stringify(get('COVEO_LANGUAGE', 'en'))},
  country: ${JSON.stringify(get('COVEO_COUNTRY', 'US'))},
  currency: ${JSON.stringify(get('COVEO_CURRENCY', 'USD'))},
  endpoint: ${JSON.stringify(get('COVEO_ENDPOINT'))},
};
`;

mkdirSync(dirname(OUTPUT_PATH), {recursive: true});
writeFileSync(OUTPUT_PATH, output);
console.log('Generated src/environments/environment.ts from .env');
