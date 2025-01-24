import {readFileSync} from 'node:fs';
import path from 'node:path';

const buenoJson = JSON.parse(readFileSync('../bueno/package.json', 'utf-8'));
const headlessJson = JSON.parse(
  readFileSync('../headless/package.json', 'utf-8')
);

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
      devWatch: path.resolve(
        basePath,
        'src/external-builds/commerce/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/commerce/headless.esm.js`,
    },
    '@coveo/headless/insight': {
      devWatch: path.resolve(
        basePath,
        'src/external-builds/insight/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/insight/headless.esm.js`,
    },
    '@coveo/headless/recommendation': {
      devWatch: path.resolve(
        basePath,
        'src/external-builds/recommendation/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/recommendation/headless.esm.js`,
    },
    '@coveo/headless/case-assist': {
      devWatch: path.resolve(
        basePath,
        'src/external-builds/case-assist/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/case-assist/headless.esm.js`,
    },
    '@coveo/headless': {
      devWatch: path.resolve(basePath, 'src/external-builds/headless.esm.js'),
      cdn: `/headless/${headlessVersion}/headless.esm.js`,
    },
    '@coveo/bueno': {
      devWatch: path.resolve(basePath, 'src/external-builds/bueno.esm.js'),
      cdn: `/bueno/${buenoVersion}/bueno.esm.js`,
    },
  };
}
