import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import {resolve as resolvePath} from 'path';
import copy from 'rollup-plugin-copy';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';

const packageMappings = generateExternalPackageMappings(import.meta.dirname);

const externalizeDependenciesPlugin = () => {
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

export default {
  input: resolvePath('dist/atomic/loader/index.js'),
  output: {
    dir: 'cdn',
    format: 'esm',
  },
  external: [/.*\/headless\/v.*/, /.*\/atomic\/v.*/, /.*\/bueno\/v.*/],
  plugins: [
    resolve({preserveSymlinks: false}),
    externalizeDependenciesPlugin(),
    commonjs(),
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.CDN_LOCAL': JSON.stringify(process.env.CDN_LOCAL),
    }),
    copy({
      targets: [
        {
          src: 'fake-loader/atomic.esm.js',
          dest: 'cdn',
        },
        {
          src: 'dist/atomic/lang/*',
          dest: 'cdn/lang',
        },
        {
          src: 'dist/atomic/assets/*',
          dest: 'cdn/assets',
        },
        {
          src: 'dist/atomic/themes/*',
          dest: 'cdn/themes',
        },
      ],
    }),
  ],
};
