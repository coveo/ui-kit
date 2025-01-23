import {Config} from '@stencil/core';
import {PluginImpl} from 'rollup';
//@ts-expect-error - json import
import buenoJson from '../bueno/package.json';
//@ts-expect-error - json import
import headlessJson from '../headless/package.json';

const isNightly = process.env.IS_NIGHTLY === 'true';

const headlessVersion = isNightly
  ? `v${headlessJson.version.split('.').shift()}-nightly`
  : 'v' + headlessJson.version;

const buenoVersion = isNightly
  ? `v${buenoJson.version.split('.').shift()}-nightly`
  : 'v' + buenoJson.version;

const packageMappings: {
  [key: string]: {cdn: string};
} = {
  '@coveo/headless': {
    cdn: `/headless/${headlessVersion}/headless.esm.js`,
  },
  '@coveo/bueno': {
    cdn: `/bueno/${buenoVersion}/bueno.esm.js`,
  },
};

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const externalizeDependenciesPlugin: PluginImpl = () => {
  return {
    name: 'externalize-dependencies',
    resolveId: (source, _importer, _options) => {
      const packageMapping = packageMappings[source];

      if (packageMapping) {
        if (!isCDN) {
          return false;
        }

        return {
          id: packageMapping.cdn,
          external: 'absolute',
        };
      }

      return null;
    },
  };
};

export const config: Config = {
  namespace: 'atomic-hosted-page',
  taskQueue: 'async',
  sourceMap: true,
  devServer: {
    port: 3335,
    reloadStrategy: 'pageReload',
  },
  outputTargets: [
    {
      type: 'dist',
      collectionDir: null,
      esmLoaderPath: '../loader',
    },
  ],
  rollupPlugins: {
    before: [externalizeDependenciesPlugin()],
  },
};
