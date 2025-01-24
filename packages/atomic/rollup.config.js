import resolve from '@rollup/plugin-node-resolve';
import {readdirSync, statSync} from 'fs';
import {fileURLToPath} from 'node:url';
import {join, resolve as resolvePath, relative, dirname} from 'path';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.js';

const isCDN = process.env.DEPLOYMENT_ENVIRONMENT === 'CDN';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageMappings = generateExternalPackageMappings(__dirname);

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

const distDirs = getDirectories(
  resolvePath('dist/atomic/components/components')
);

const inputFiles = distDirs.flatMap((distDir) => {
  return readdirSync(distDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => join(distDir, file));
});

export default {
  input: inputFiles,
  output: {
    dir: 'dist/atomic/components/components',
    format: 'esm',
    entryFileNames: ({facadeModuleId}) => {
      const relativePath = relative(
        resolvePath('dist/atomic/components/components'),
        facadeModuleId
      );
      return `${relativePath}`;
    },
    chunkFileNames: '[name].js',
    manualChunks: (id) => {
      if (id.includes('node_modules')) {
        return (
          'vendor/' +
          id.toString().split('node_modules/')[1].split('/')[0].toString()
        );
      }
    },
  },
  plugins: [
    resolve({preserveSymlinks: false}),
    externalizeDependenciesPlugin(),
  ],

  external: [/\.tw.css$/],
};
