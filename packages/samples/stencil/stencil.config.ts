import {Config} from '@stencil/core';
import {readFileSync} from 'node:fs';
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
      resolveCoveoPaths(),
    ],
  },
};

function resolveCoveoPaths() {
  return {
    name: 'resolve-coveo-paths',
    resolveId(source: string) {
      if (
        source.startsWith('@coveo/atomic/') ||
        source.startsWith('@coveo/headless/')
      ) {
        const nodeModulesLocation = '../../../node_modules';
        const packageName = source.startsWith('@coveo/atomic/')
          ? 'atomic'
          : 'headless';

        const packageJsonPath = join(
          process.cwd(),
          nodeModulesLocation,
          '@coveo',
          packageName,
          'package.json'
        );

        try {
          const packageJson = JSON.parse(
            readFileSync(packageJsonPath, 'utf-8')
          );

          const subPath = './' + source.replace(`@coveo/${packageName}/`, '');
          const subPathImport = packageJson.exports?.[subPath]?.import;

          if (subPathImport) {
            return {
              id: `${nodeModulesLocation}/@coveo/${packageName}/${subPathImport}`,
            };
          }
        } catch (err) {
          console.error(`Error resolving ${source}:`, err);
        }
      }
      return null;
    },
  };
}
