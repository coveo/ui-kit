import {Config} from '@stencil/core';
import {readFileSync} from 'fs';
import {join} from 'path';
import html from 'rollup-plugin-html';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/style/index.css',
  globalScript: 'src/utils/atomic-loader.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'pages', keepDirStructure: false},
        {
          src: '../../../../node_modules/@coveo/atomic/dist/atomic/assets',
          dest: 'assets',
          keepDirStructure: false,
        },
        {
          src: '../../../../node_modules/@coveo/atomic/dist/atomic/lang',
          dest: 'lang',
          keepDirStructure: false,
        },
        {
          src: '../../../../node_modules/@coveo/atomic/dist/atomic/themes',
          dest: 'themes',
          keepDirStructure: false,
        },
      ],
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
      resolveAtomicPaths(),
    ],
  },
};

function resolveAtomicPaths() {
  return {
    resolveId(source: string) {
      if (source.startsWith('@coveo/atomic/')) {
        const nodeModulesLocation = '../../../node_modules';

        const packageJsonPath = join(
          process.cwd(),
          nodeModulesLocation,
          '@coveo',
          'atomic',
          'package.json'
        );

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        const subPath = './' + source.replace('@coveo/atomic/', '');
        const subPathImport = packageJson.exports[subPath].import;

        const id = `${nodeModulesLocation}/@coveo/atomic/${subPathImport}`;
        return {
          id,
        };
      }
      return null;
    },
  };
}
