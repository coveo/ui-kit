/**
 * Reads .env (or OS environment variables) and generates src/environments/environment.ts.
 * Run before build: `node scripts/generate-env.mjs`
 */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');
const OUTPUT_PATH = resolve(ROOT, 'src/environments/environment.ts');

function loadEnvFile() {
  try {
    const content = readFileSync(ENV_PATH, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnvFile();

function get(key, fallback = '') {
  return process.env[key] || env[key] || fallback;
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
