import {readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {rsbuild as rsbuildApi} from '@rslib/core';
import colors from '../../utils/ci/colors.mjs';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const {version} = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf8')
);
const packageMappings = generateExternalPackageMappings(__dirname);

const rsbuild = await rsbuildApi.createRsbuild({
  cwd: __dirname,
  rsbuildConfig: {
    source: {
      entry: {
        'atomic.esm': './src/cdn.ts',
      },
      tsconfigPath: './tsconfig.lit.json',
      decorators: {version: 'legacy'},
      define: {
        'process.env.VERSION': JSON.stringify(version),
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
    },
    output: {
      target: 'web',
      distPath: {root: 'cdn', js: '', css: ''},
      filename: {js: '[name].js'},
      cleanDistPath: true,
      sourceMap: {js: 'source-map'},
      externals: [
        ({request}, callback) => {
          if (!request) return callback();
          const mapping = packageMappings[request];
          if (mapping) {
            return callback(null, mapping.cdn);
          }
          callback();
        },
      ],
      copy: [
        {from: 'dist/lang', to: 'lang'},
        {from: 'dist/assets', to: 'assets'},
        {from: 'dist/themes', to: 'themes'},
      ],
    },
    tools: {
      htmlPlugin: false,
      rspack: (config) => {
        config.output ??= {};
        config.output.module = true;
        config.output.library = {type: 'module'};
        config.output.chunkFormat = 'module';
        config.output.chunkLoading = 'import';
        config.output.chunkFilename = '[name]-[contenthash:8].js';
        config.output.assetModuleFilename = '[name][ext]';
        config.output.environment ??= {};
        config.output.environment.module = true;
        config.output.environment.dynamicImport = true;

        config.experiments ??= {};
        config.experiments.outputModule = true;

        config.optimization ??= {};
        config.optimization.sideEffects = true;

        config.module ??= {};
        config.module.rules ??= [];

        // SVG imports → raw string content (override rsbuild's default asset handling)
        function excludeSvgFromRules(rules) {
          for (const rule of rules) {
            if (rule.test instanceof RegExp && rule.test.test('.svg')) {
              rule.exclude = [/\.svg$/].concat(rule.exclude || []);
            }
            if (rule.oneOf) excludeSvgFromRules(rule.oneOf);
          }
        }
        excludeSvgFromRules(config.module.rules);
        config.module.rules.push({
          test: /\.svg$/,
          type: 'asset/source',
        });

        // Standalone .tw.css files → process through PostCSS, export as JS string
        config.module.rules.unshift({
          test: /\.tw\.css$/,
          type: 'javascript/auto',
          use: [
            {
              loader: resolve(
                __dirname,
                'scripts/lit-css-transform-loader.mjs'
              ),
            },
          ],
        });

        // Pre-process inline css`...` in TypeScript files through PostCSS/Tailwind
        config.module.rules.unshift({
          test: /\.ts$/,
          enforce: 'pre',
          use: [
            {
              loader: resolve(
                __dirname,
                'scripts/lit-css-transform-loader.mjs'
              ),
            },
          ],
        });

        // Exclude .tw.css from rsbuild's default CSS rules
        for (const rule of config.module.rules) {
          if (
            rule.test instanceof RegExp &&
            rule.test.test('.css') &&
            !rule.test.test('.tw.css.ts')
          ) {
            rule.exclude = [/\.tw\.css$/].concat(rule.exclude || []);
          }
        }
      },
    },
    performance: {
      chunkSplit: {
        strategy: 'split-by-module',
      },
    },
  },
});

await rsbuild.build();
console.log(colors.bold.blue('CDN build complete'));
