import {resolve as resolvePath} from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';

const packageMappings = generateExternalPackageMappings(import.meta.dirname);

const externalizeDependenciesPlugin = () => {
  return {
    name: 'externalize-dependencies',
    resolveId: (source, _importer, _options) => {
      const packageMapping = packageMappings[source];

      if (packageMapping) {
        return {
          id: packageMapping.cdn,
          external: 'absolute',
        };
      }
      return null;
    },
    // TODO KIT-4574: This is hackish, we should find better way to handle this.
    // (moduleSideEffects didn't work, maybe it'll work better with Lit only)
    // Clean up side-effects imports from Headless & Bueno
    renderChunk(code) {
      const cleanedCode = code
        .replaceAll(
          /^\s*import\s+['"][^'"]*\/(headless|bueno)\/[^'"]*['"];?\s*$/gm,
          ''
        )
        .replaceAll(/\n\s*\n/g, '\n'); // Clean up extra empty lines

      return cleanedCode;
    },
  };
};

export default {
  input: [
    resolvePath('dist/atomic/loader/index.js'),
    resolvePath('dist/atomic/index.esm.js'),
  ],
  output: {
    dir: 'cdn',
    format: 'esm',
    sourcemap: true,
  },
  external: [/.*\/headless\/v.*/, /.*\/atomic\/v.*/, /.*\/bueno\/v.*/],
  plugins: [
    resolve({preserveSymlinks: false}),
    externalizeDependenciesPlugin(),
    commonjs(),
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
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
