import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const buenoBaseDir = resolve(import.meta.dirname, '../../bueno');
const buenoJson = JSON.parse(
  readFileSync(resolve(buenoBaseDir, 'package.json'), 'utf-8')
);

const headlessBaseDir = resolve(import.meta.dirname, '../../headless');
const headlessJson = JSON.parse(
  readFileSync(resolve(headlessBaseDir, 'package.json'), 'utf-8')
);

const isNightly = process.env.IS_NIGHTLY === 'true';

const headlessVersion = isNightly
  ? `v${headlessJson.version.split('.').shift()}-nightly`
  : `v${headlessJson.version}`;

const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : `v${buenoJson.version}`;

export function generateExternalPackageMappings() {
  return {
    '@coveo/headless/commerce': {
      cdn: `/headless/${headlessVersion}/commerce/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/commerce.index.ts'),
      localBaseDir: resolve(headlessBaseDir),
    },
    '@coveo/headless/insight': {
      cdn: `/headless/${headlessVersion}/insight/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/insight.index.ts'),
      localBaseDir: resolve(headlessBaseDir),
    },
    '@coveo/headless/recommendation': {
      cdn: `/headless/${headlessVersion}/recommendation/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/recommendation.index.ts'),
      localBaseDir: resolve(headlessBaseDir),
    },
    '@coveo/headless/case-assist': {
      cdn: `/headless/${headlessVersion}/case-assist/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/case-assist.index.ts'),
      localBaseDir: resolve(headlessBaseDir),
    },
    '@coveo/headless': {
      cdn: `/headless/${headlessVersion}/headless.esm.js`,
      local: resolve(headlessBaseDir, './src/index.ts'),
      localBaseDir: resolve(headlessBaseDir),
    },
    '@coveo/bueno': {
      cdn: `/bueno/${buenoVersion}/bueno.esm.js`,
      local: resolve(buenoBaseDir, './src/index.ts'),
      localBaseDir: resolve(buenoBaseDir),
    },
  };
}
