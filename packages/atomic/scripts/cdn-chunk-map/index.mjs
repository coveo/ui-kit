#!/usr/bin/env node
// Keeps cdn-chunk-map.json, the map that tells the CDN build (rsbuild.cdn.mjs) which lazily
// loaded modules travel together in one file. Why the map exists and how it was validated:
// docs/adr/0002-compute-the-cdn-chunk-partition.md.
//
// The map is computed by web-bundle-partition (github.com/coveo-incubator/web-bundle-partition)
// from the module graph and the page shapes of the repository. `prepare` writes its inputs under
// .cdn-chunk-map/: the stats and files of an analysis build of the CDN bundle, which give every
// module's static imports and size; the Atomic tags each known page uses (pages.mjs); and a
// request file that names them. `generate` and `check` then run the tool on that request.
//
// The map goes stale when the module graph changes under it: a module the map does not name falls
// back to the cache groups of ADR 0001, and a module whose pages changed makes those pages
// download a chunk for its sake. `check` fails on both; `generate` rewrites the map when it is
// stale (or with --force), so a map that is still right keeps its chunk names. CI runs the tool
// as a GitHub Action after the prepare task (.github/workflows/ci.yml).
//
// Usage, from packages/atomic, after build:lit:
//   node scripts/cdn-chunk-map/index.mjs prepare
//   node scripts/cdn-chunk-map/index.mjs generate [--force]
//   node scripts/cdn-chunk-map/index.mjs check
// generate and check fetch the tool with npx; WEB_BUNDLE_PARTITION=<checkout> uses a local copy.
import {spawnSync} from 'node:child_process';
import {mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {buildCdn} from '../../rsbuild.cdn.mjs';
import {CHUNK_MAP_FILE} from './chunk-map.mjs';
import {collectPageShapes} from './pages.mjs';

const ATOMIC = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ATOMIC, '.cdn-chunk-map');
const REQUEST_FILE = join(OUT, 'request.json');
// The commit of coveo-incubator/web-bundle-partition that .github/workflows/ci.yml also pins.
const TOOL = 'github:coveo-incubator/web-bundle-partition#7b3f7889037fc59cc323dc88793b63d7432636aa';

const {positionals, values: options} = parseArgs({
  allowPositionals: true,
  options: {force: {type: 'boolean'}},
});

async function prepare() {
  rmSync(OUT, {recursive: true, force: true});
  mkdirSync(OUT, {recursive: true});
  const {knownTags, pages} = collectPageShapes(ATOMIC);
  const buildDir = join(OUT, 'build');
  const statsFile = join(OUT, 'stats.json');
  await buildCdn({distPath: buildDir, chunkMap: null, analysis: {statsFile}});
  const pagesFile = join(OUT, 'pages.json');
  const shapes = {roots: knownTags, pages: pages.map(({id, tags}) => ({id, roots: tags}))};
  writeFileSync(pagesFile, JSON.stringify(shapes, null, 2));
  const request = {
    stats: statsFile,
    buildDir,
    pages: pagesFile,
    map: join(ATOMIC, CHUNK_MAP_FILE),
    root: ATOMIC,
    entry: 'atomic.esm',
    chunkPrefix: 'atomic-c',
    about:
      'Which lazily loaded modules share a CDN file, computed by web-bundle-partition from the page shapes of the repository. scripts/cdn-chunk-map prepares its inputs.',
    hint: 'pnpm --filter @coveo/atomic run generate:cdn-chunk-map',
  };
  writeFileSync(REQUEST_FILE, JSON.stringify(request, null, 2));
  console.log(`Wrote the chunk-map request to ${REQUEST_FILE}.`);
}

function runTool(command) {
  const args = [command, '--request', REQUEST_FILE, ...(options.force ? ['--force'] : [])];
  const checkout = process.env.WEB_BUNDLE_PARTITION;
  const run = checkout
    ? spawnSync(process.execPath, [join(checkout, 'src/cli.mjs'), ...args], {stdio: 'inherit'})
    : spawnSync('npx', ['--yes', TOOL, ...args], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
  if (run.error) {
    throw run.error;
  }
  process.exitCode = run.status ?? 1;
}

const commands = {
  prepare,
  async generate() {
    await prepare();
    runTool('generate');
  },
  async check() {
    await prepare();
    runTool('check');
  },
};
const command = commands[positionals[0]];
if (!command) {
  throw new Error(`Unknown command "${positionals[0] ?? ''}"; use prepare, generate or check.`);
}
await command();
