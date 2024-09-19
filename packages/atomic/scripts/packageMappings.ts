import path from 'node:path';
import headlessJson from '../../../packages/headless/package.json';
import buenoJson from '../../../packages/headless/package.json';

let headlessVersion: string = '';
let buenoVersion: string = '';

headlessVersion = 'v' + headlessJson.version;
buenoVersion = 'v' + buenoJson.version;

export const packageMappings: {[key: string]: {devWatch: string; cdn: string}} =
  {
    '@coveo/headless/commerce': {
      devWatch: path.resolve(
        __dirname,
        '../src/external-builds/commerce/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/commerce/headless.esm.js`,
    },
    '@coveo/headless/insight': {
      devWatch: path.resolve(
        __dirname,
        '../src/external-builds/insight/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/insight/headless.esm.js`,
    },
    '@coveo/headless/product-recommendation': {
      devWatch: path.resolve(
        __dirname,
        '../src/external-builds/product-recommendation/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/product-recommendation/headless.esm.js`,
    },
    '@coveo/headless/recommendation': {
      devWatch: path.resolve(
        __dirname,
        '../src/external-builds/recommendation/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/recommendation/headless.esm.js`,
    },
    '@coveo/headless/case-assist': {
      devWatch: path.resolve(
        __dirname,
        '../src/external-builds/case-assist/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/case-assist/headless.esm.js`,
    },
    '@coveo/headless': {
      devWatch: path.resolve(
        __dirname,
        '../src/external-builds/headless.esm.js'
      ),
      cdn: `/headless/${headlessVersion}/headless.esm.js`,
    },
    '@coveo/bueno': {
      devWatch: path.resolve(__dirname, './src/external-builds/bueno.esm.js'),
      cdn: `/bueno/${buenoVersion}/bueno.esm.js`,
    },
  };
