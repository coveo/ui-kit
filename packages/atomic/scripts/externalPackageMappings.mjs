import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const buenoBaseDir = resolve(import.meta.dirname, '../../bueno');
const buenoJson = JSON.parse(readFileSync(resolve(buenoBaseDir, 'package.json'), 'utf-8'));

const headlessBaseDir = resolve(import.meta.dirname, '../../headless');
const headlessJson = JSON.parse(readFileSync(resolve(headlessBaseDir, 'package.json'), 'utf-8'));

const isNightly = process.env.IS_NIGHTLY === 'true';
const commitSha = process.env.CDN_COMMIT_SHA;

const headlessVersion = isNightly
  ? `v${headlessJson.version.split('.').shift()}-nightly`
  : `v${headlessJson.version}`;

const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : `v${buenoJson.version}`;

const headlessBase = commitSha ? `/headless/commits/${commitSha}` : `/headless/${headlessVersion}`;
const buenoBase = commitSha ? `/bueno/commits/${commitSha}` : `/bueno/${buenoVersion}`;

export function generateExternalPackageMappings() {
  return {
    '@coveo/headless/commerce': {
      cdn: `${headlessBase}/commerce/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/commerce.index.ts'),
    },
    '@coveo/headless/insight': {
      cdn: `${headlessBase}/insight/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/insight.index.ts'),
    },
    '@coveo/headless/recommendation': {
      cdn: `${headlessBase}/recommendation/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/recommendation.index.ts'),
    },
    '@coveo/headless/case-assist': {
      cdn: `${headlessBase}/case-assist/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/case-assist.index.ts'),
    },
    '@coveo/headless': {
      cdn: `${headlessBase}/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/index.ts'),
    },
    '@coveo/bueno': {
      cdn: `${buenoBase}/bueno.esm.js`,
      local: resolve(buenoBaseDir, './src/index.ts'),
    },
  };
}
