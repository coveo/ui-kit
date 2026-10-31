// PROTOTYPE — throwaway copy of ../../rsbuild.cdn.mjs used to answer one question:
// does a solver-computed chunk partition beat the hand-picked `minChunks: 10` of ADR 0001?
// Differences from the real config: output goes to PROTO_OUT, rspack stats are written to
// PROTO_STATS, and PROTO_CHUNK_MAP (JSON: {modules: {absoluteResourcePath: chunkName}}) adds
// one enforced async cache group per chunk name. Nothing here ships.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {relative} from 'node:path/posix';
import {fileURLToPath} from 'node:url';
import {rsbuild as rsbuildApi} from '@rslib/core';
import {generateExternalPackageMappings} from '../externalPackageMappings.mjs';

const atomicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = process.env.PROTO_OUT ?? join(atomicDir, 'cdn-proto');
const statsPath = process.env.PROTO_STATS ?? join(outDir, 'stats.json');
const chunkMapPath = process.env.PROTO_CHUNK_MAP;
const chunkMap = chunkMapPath ? JSON.parse(readFileSync(chunkMapPath, 'utf8')).modules : null;

const {version} = JSON.parse(readFileSync(join(atomicDir, 'package.json'), 'utf8'));
const packageMappings = generateExternalPackageMappings(atomicDir);
const sourceDir = join(atomicDir, 'src');
const litRuntime =
  /node_modules[\\/](?:lit|lit-html|lit-element|@lit[\\/](?:reactive-element|context)|tslib)[\\/]/;

const enforcedGroups = {};
if (chunkMap) {
  const names = new Set(Object.values(chunkMap));
  for (const name of names) {
    enforcedGroups[`proto_${name}`] = {
      test: (module) => {
        const resource =
          module.resource ?? module.nameForCondition?.() ?? module.identifier?.() ?? '';
        return chunkMap[resource] === name;
      },
      name,
      chunks: 'async',
      enforce: true,
      priority: 50,
      reuseExistingChunk: true,
    };
  }
  console.log(
    `[proto] enforcing ${names.size} chunks over ${Object.keys(chunkMap).length} modules`
  );
}

let splitChunksSnapshot = '{}';
const statsPlugin = {
  apply(compiler) {
    compiler.hooks.done.tap('proto-stats', (stats) => {
      const json = stats.toJson({
        all: false,
        assets: true,
        chunks: true,
        chunkRelations: true,
        chunkOrigins: true,
        entrypoints: true,
        modules: true,
        nestedModules: true,
        reasons: true,
        ids: true,
        cachedModules: true,
        errors: true,
        warnings: true,
      });
      mkdirSync(dirname(statsPath), {recursive: true});
      writeFileSync(statsPath, JSON.stringify(json));
      writeFileSync(join(dirname(statsPath), 'split-chunks-config.json'), splitChunksSnapshot);
      console.log(`[proto] stats written to ${statsPath}`);
    });
  },
};

const rsbuild = await rsbuildApi.createRsbuild({
  cwd: atomicDir,
  rsbuildConfig: {
    source: {
      entry: {
        'atomic.esm': './src/cdn.ts',
        index: './src/loader.ts',
        'index.esm': './src/index.ts',
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
      distPath: {root: outDir, js: '', css: ''},
      filename: {js: '[name].js'},
      cleanDistPath: true,
      sourceMap: {js: false},
      externals: [
        ({request}, callback) => {
          if (!request) return callback();
          const mapping = packageMappings[request];
          if (mapping?.cdn) {
            return callback(null, mapping.cdn);
          }
          callback();
        },
      ],
    },
    tools: {
      htmlPlugin: false,
      rspack: (config, {appendPlugins}) => {
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
        config.optimization.avoidEntryIife = true;
        // PROTOTYPE: the analysis build keeps every module separate so the model sees each file
        if (process.env.PROTO_NO_CONCAT) config.optimization.concatenateModules = false;

        config.module ??= {};
        config.module.parser ??= {};
        config.module.parser.javascript ??= {};
        config.module.parser.javascript.importMeta = false;

        config.module.rules ??= [];
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
        config.module.rules.unshift({
          test: /\.tw\.css$/,
          type: 'javascript/auto',
          use: [{loader: resolve(atomicDir, 'scripts/lit-css-transform-loader.mjs')}],
        });
        config.module.rules.unshift({
          test: /\.ts$/,
          enforce: 'pre',
          use: [{loader: resolve(atomicDir, 'scripts/lit-css-transform-loader.mjs')}],
        });
        config.module.rules.unshift({
          test: (value) => {
            const relativePath = relative(resolve(atomicDir), value);
            return Boolean(relativePath.match(/^src\/components\/\w*\/([\w-]*)\/\1(\.[jt]s)?$/));
          },
          enforce: 'pre',
          sideEffects: true,
        });
        for (const rule of config.module.rules) {
          if (
            rule.test instanceof RegExp &&
            rule.test.test('.css') &&
            !rule.test.test('.tw.css.ts')
          ) {
            rule.exclude = [/\.tw\.css$/].concat(rule.exclude || []);
          }
        }

        appendPlugins(statsPlugin);
        splitChunksSnapshot = JSON.stringify(
          config.optimization.splitChunks,
          (_k, v) => (typeof v === 'function' ? '[fn]' : v instanceof RegExp ? String(v) : v),
          2
        );
      },
    },
    performance: {
      chunkSplit: {
        strategy: 'split-by-module',
        override: {
          cacheGroups: {
            shared: {
              test: (module) => {
                const resource = module.resource ?? '';
                return resource.startsWith(sourceDir) || litRuntime.test(resource);
              },
              minChunks: 10,
              name: 'atomic-shared',
              priority: 0,
              reuseExistingChunk: true,
            },
            dayjsLocales: {
              test: /node_modules[\\/]dayjs[\\/]locale[\\/]/,
              priority: 0,
              name: false,
              reuseExistingChunk: true,
            },
            ...enforcedGroups,
          },
        },
      },
    },
  },
});

const started = Date.now();
await rsbuild.build();
console.log(
  `[proto] build complete in ${((Date.now() - started) / 1000).toFixed(0)} s -> ${outDir}`
);
