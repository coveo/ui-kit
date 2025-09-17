import {spawnSync} from 'node:child_process';
import {dirname} from 'node:path';
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
          src: dirname(require.resolve('@coveo/atomic/assets/account.svg')),
          dest: 'assets',
          keepDirStructure: false,
        },
        {
          src: dirname(require.resolve('@coveo/atomic/lang/en.json')),
          dest: 'lang',
          keepDirStructure: false,
        },
        {
          src: dirname(require.resolve('@coveo/atomic/themes/coveo.css')),
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
