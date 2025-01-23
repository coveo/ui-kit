import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import {readdirSync, statSync} from 'fs';
import {join, resolve as resolvePath, relative} from 'path';

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
      console.log(id);
      if (id.includes('node_modules')) {
        return (
          'vendor/' +
          id.toString().split('node_modules/')[1].split('/')[0].toString()
        );
      }
    },
  },
  plugins: [resolve({preserveSymlinks: false}), json()],
  external: ['@coveo/bueno', '@stencil/core', 'dompurify'],
};
