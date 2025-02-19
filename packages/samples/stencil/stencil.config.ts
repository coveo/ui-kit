import {Config} from '@stencil/core';
import {spawnSync} from 'node:child_process';
//@ts-expect-error will be fixed when @types/node 22.14+ will be released
import {findPackageJSON} from 'node:module';
import {dirname, join} from 'node:path';
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
      coveoResolve(),
    ],
    after: [nodePolyfills()],
  },
};

function coveoResolve() {
  return {
    resolveId(source: string, importer: string) {
      if (source === '@coveo/relay') {
        return {id: resolveRelay(importer)};
      }
      if (source.startsWith('@coveo')) {
        return nodeResolve(source, importer, ['browser', 'default', 'import']);
      }
    },
  };
}

function resolveRelay(importer: string) {
  const relayPackageJSONPath = findPackageJSON('@coveo/relay', importer);
  const relayPackageJSON = require(relayPackageJSONPath);
  const defaultRelativePath = relayPackageJSON.exports.default.default;
  return join(dirname(relayPackageJSONPath), defaultRelativePath);
}

function nodeResolve(
  source: string,
  importer: string,
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
