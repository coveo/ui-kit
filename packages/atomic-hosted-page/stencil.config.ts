import {Config} from '@stencil/core';
import {PluginImpl} from 'rollup';
import {generateExternalPackageMappings} from './scripts/external-package-mappings';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const packageMappings = generateExternalPackageMappings();

const externalizeDependenciesPlugin: PluginImpl = () => {
  return {
    name: 'externalize-dependencies',
    resolveId: (source, _importer, _options) => {
      const packageMapping = packageMappings[source];

      console.log('packageMapping', packageMapping);
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
