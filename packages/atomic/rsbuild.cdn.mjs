// ⚠️  CDN OUTPUT: This build outputs to "cdn/". If you change this path,
// you MUST also update the corresponding "source" field in ui-kit-cd
// (.deployment.config/{commit,dev,prd}.json) and deploy-local-cdn.mjs.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {relative} from 'node:path/posix';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {rsbuild as rsbuildApi} from '@rslib/core';
import colors from '../../utils/ci/colors.mjs';
import {chunkOfModule, moduleKey, readChunkMap} from './scripts/cdn-chunk-map/chunk-map.mjs';
import {generateExternalPackageMappings} from './scripts/externalPackageMappings.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const {version} = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
const packageMappings = generateExternalPackageMappings(__dirname);
const sourceDir = join(__dirname, 'src');
const litRuntime =
  /node_modules[\\/](?:lit|lit-html|lit-element|@lit[\\/](?:reactive-element|context)|tslib)[\\/]/;

// One enforced async cache group per chunk of the map. Why the chunks are computed rather than
// chosen by a threshold: docs/adr/0002-compute-the-cdn-chunk-partition.md
function mappedCacheGroups(chunkMap) {
  const chunkOf = chunkOfModule(chunkMap);
  const groups = {};
  for (const name of new Set(chunkOf.values())) {
    groups[`chunkMap:${name}`] = {
      test: (module) => {
        const resource = module.resource ?? module.nameForCondition?.();
        return Boolean(resource) && chunkOf.get(moduleKey(resource, __dirname)) === name;
      },
      name,
      chunks: 'async',
      enforce: true,
      priority: 50,
      reuseExistingChunk: true,
    };
  }
  return groups;
}

function statsPlugin(statsFile) {
  return {
    apply(compiler) {
      compiler.hooks.done.tap('cdn-chunk-map-stats', (stats) => {
        const json = stats.toJson({
          all: false,
          chunks: true,
          entrypoints: true,
          modules: true,
          nestedModules: true,
          reasons: true,
          ids: true,
          cachedModules: true,
        });
        mkdirSync(dirname(statsFile), {recursive: true});
        writeFileSync(statsFile, JSON.stringify(json));
      });
    },
  };
}

/**
 * Builds the CDN bundle. The chunk map (cdn-chunk-map.json) decides which lazily loaded modules
 * share a file. An `analysis` build is what the chunk-map generator reads: every module stays its
 * own stats entry (no concatenation) and rspack's stats go to `analysis.statsFile`.
 */
export async function buildCdn({
  distPath = 'cdn',
  chunkMap = readChunkMap(__dirname),
  analysis = null,
} = {}) {
  const rsbuild = await rsbuildApi.createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      logLevel: analysis ? 'warn' : 'info',
      source: {
        entry: {
          // ⚠️  Changing these entry names affects CDN pointer files in ui-kit-cd.
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
        distPath: {root: distPath, js: '', css: ''},
        filename: {js: '[name].js'},
        cleanDistPath: true,
        sourceMap: {js: analysis ? false : 'source-map'},
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
        copy: analysis
          ? []
          : [
              {from: 'dist/lang', to: 'lang'},
              {from: 'dist/assets', to: 'assets'},
              {from: 'dist/themes', to: 'themes'},
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
          if (analysis) {
            config.optimization.concatenateModules = false;
            appendPlugins(statsPlugin(analysis.statsFile));
          }

          config.module ??= {};
          config.module.parser ??= {};
          config.module.parser.javascript ??= {};
          config.module.parser.javascript.importMeta = false;

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
                loader: resolve(__dirname, 'scripts/lit-css-transform-loader.mjs'),
              },
            ],
          });

          // Pre-process inline css`...` in TypeScript files through PostCSS/Tailwind
          config.module.rules.unshift({
            test: /\.ts$/,
            enforce: 'pre',
            use: [
              {
                loader: resolve(__dirname, 'scripts/lit-css-transform-loader.mjs'),
              },
            ],
          });
          config.module.rules.unshift({
            test: (value) => {
              // If the import path matches src/components/<group>/<component>/<component>.ts or .js, mark it as side-effectful to prevent tree-shaking when imported by other modules.
              const relativePath = relative(resolve(__dirname), value);
              return Boolean(relativePath.match(/^src\/components\/\w*\/([\w-]*)\/\1(\.[jt]s)?$/));
            },
            enforce: 'pre',
            sideEffects: true,
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
        printFileSize: !analysis,
        chunkSplit: {
          strategy: 'split-by-module',
          override: {
            cacheGroups: {
              // One chunk for the code most components share, instead of hundreds of tiny ones.
              // Why only Atomic's source and the Lit runtime, and why 10:
              // docs/adr/0001-group-shared-modules-in-one-cdn-chunk.md
              // The chunk map takes precedence; this group keeps the modules it does not name.
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
              // Keep each lazily imported dayjs locale in its own chunk; otherwise
              // split-by-module folds all 140+ of them into the dayjs chunk every page loads.
              dayjsLocales: {
                test: /node_modules[\\/]dayjs[\\/]locale[\\/]/,
                priority: 0,
                name: false,
                reuseExistingChunk: true,
              },
              ...(chunkMap ? mappedCacheGroups(chunkMap) : {}),
            },
          },
        },
      },
    },
  });

  await rsbuild.build();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await buildCdn();
  console.log(colors.bold.blue('CDN build complete'));
}
