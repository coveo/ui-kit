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
