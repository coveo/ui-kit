import buenoJson from '../../bueno/package.json';
import headlessJson from '../../headless/package.json';

const isNightly = process.env.IS_NIGHTLY === 'true';

const headlessVersion = isNightly
  ? `v${headlessJson.version.split('.').shift()}-nightly`
  : 'v' + headlessJson.version;

const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : 'v' + buenoJson.version;

export function generateExternalPackageMappings(): {
  [key: string]: {cdn: string};
} {
  return {
    '@coveo/headless': {
      cdn: `/headless/${headlessVersion}/headless.esm.js`,
    },
    '@coveo/bueno': {
      cdn: `/bueno/${buenoVersion}/bueno.esm.js`,
    },
  };
}
