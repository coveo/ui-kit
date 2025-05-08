import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import {readdirSync, statSync} from 'fs';
import {join, resolve as resolvePath, relative, sep} from 'path';
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

const getDirectories = (src) => {
  const dirs = [];
  const files = readdirSync(src);
  files.forEach((file) => {
    const fullPath = join(src, file);
    if (statSync(fullPath).isDirectory()) {
      dirs.push(fullPath);
      dirs.push(...getDirectories(fullPath));
    }
  });
  return dirs;
};

const distDirs = getDirectories(resolvePath('dist/atomic'));

const inputFiles = distDirs.flatMap((distDir) => {
  return readdirSync(distDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => join(distDir, file));
});

const manualChunksPackages = [
  '@lit',
  'dayjs',
  '@stencil',
  'dompurify',
  'lit-element',
  'lit-html',
  'lit',
];

export default {
  input: inputFiles,
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: ({facadeModuleId}) => {
      const relativePath = relative(resolvePath('dist'), facadeModuleId);
      return `${relativePath}`;
    },
    chunkFileNames: '[name]-[hash].js',
    manualChunks: (id) => {
      if (
        id.includes('node_modules') &&
        manualChunksPackages.some((pkg) => id.includes(pkg))
      ) {
        return join(
          'atomic',
          'vendor',
          id.toString().split(`node_modules${sep}`)[1].split(sep)[0].toString()
        );
      }
    },
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
  ],
};
