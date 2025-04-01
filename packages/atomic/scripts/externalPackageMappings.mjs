import {readFileSync} from 'fs';
import path from 'path';

const buenoJsonPath = new URL('../../bueno/package.json', import.meta.url);
const buenoJson = JSON.parse(readFileSync(buenoJsonPath, 'utf-8'));

const headlessJsonPath = new URL(
  '../../headless/package.json',
  import.meta.url
);
const headlessJson = JSON.parse(readFileSync(headlessJsonPath, 'utf-8'));

const isNightly = process.env.IS_NIGHTLY === 'true';

const headlessVersion = isNightly
  ? `v${headlessJson.version.split('.').shift()}-nightly`
  : 'v' + headlessJson.version;

const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : 'v' + buenoJson.version;

export function generateExternalPackageMappings(basePath) {
  return {
    '@coveo/headless/commerce': {
      cdn: `/headless/${headlessVersion}/commerce/headless.esm.js`,
    },
    '@coveo/headless/insight': {
      cdn: `/headless/${headlessVersion}/insight/headless.esm.js`,
    },
    '@coveo/headless/recommendation': {
      cdn: `/headless/${headlessVersion}/recommendation/headless.esm.js`,
    },
    '@coveo/headless/case-assist': {
      cdn: `/headless/${headlessVersion}/case-assist/headless.esm.js`,
    },
    '@coveo/headless': {
      cdn: `/headless/${headlessVersion}/headless.esm.js`,
    },
    '@coveo/bueno': {
      cdn: `/bueno/${buenoVersion}/bueno.esm.js`,
    },
  };
}
