/**
 * Reads .env (or OS environment variables) and generates src/environments/environment.ts.
 * Run before build: `node scripts/generate-env.js`
 */
const {readFileSync, writeFileSync} = require('node:fs');
const {resolve} = require('node:path');

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
  organizationId: '${get('COVEO_ORGANIZATION_ID')}',
  accessToken: '${get('COVEO_ACCESS_TOKEN')}',
  trackingId: '${get('COVEO_TRACKING_ID')}',
  language: '${get('COVEO_LANGUAGE', 'en')}',
  country: '${get('COVEO_COUNTRY', 'US')}',
  currency: '${get('COVEO_CURRENCY', 'USD')}',
  endpoint: '${get('COVEO_ENDPOINT')}',
};
`;

writeFileSync(OUTPUT_PATH, output);
console.log('Generated src/environments/environment.ts from .env');
