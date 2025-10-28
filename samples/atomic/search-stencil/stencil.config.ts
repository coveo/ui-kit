import {spawnSync} from 'node:child_process';
import type {Config} from '@stencil/core';
import html from 'rollup-plugin-html';
import nodePolyfills from 'rollup-plugin-node-polyfills';

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
          src: '../../../../packages/atomic/dist/atomic/assets',
          dest: 'assets',
          keepDirStructure: false,
        },
        {
          src: '../../../../packages/atomic/dist/atomic/lang',
          dest: 'lang',
          keepDirStructure: false,
        },
        {
          src: '../../../../packages/atomic/dist/atomic/themes',
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
      coveoResolve(),
    ],
    after: [nodePolyfills()],
  },
};

function coveoResolve() {
  return {
    resolveId(source: string, importer: string) {
      if (source.startsWith('@coveo')) {
        return nodeResolve(source, importer, ['browser', 'default', 'import']);
      }
    },
  };
}

function nodeResolve(
  source: string,
  _importer: string,
  conditions: string[] = []
) {
  return spawnSync(
    process.argv[0],
    [
      ...conditions.flatMap((condition) => ['-C', condition]),
      '-p',
      `require.resolve('${source}')`,
    ],
    {encoding: 'utf-8'}
  ).stdout.trim();
}
