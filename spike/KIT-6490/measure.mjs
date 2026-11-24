#!/usr/bin/env node
// Measures raw, gzip and brotli sizes of the Headless and Atomic bundles.
// Usage: node spike/KIT-6490/measure.mjs <label> [headless|atomic|all]
// Writes spike/KIT-6490/results/<label>.json.
import {mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {brotliCompressSync, constants, gzipSync} from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const [label, scope = 'all'] = process.argv.slice(2);
if (!label) {
  console.error('Usage: measure.mjs <label> [headless|atomic|all]');
  process.exit(1);
}

function walk(dir, filter) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out = out.concat(walk(path, filter));
    } else if (filter(path)) {
      out.push(path);
    }
  }
  return out;
}

function sizes(path) {
  const buf = readFileSync(path);
  return {
    raw: buf.length,
    gzip: gzipSync(buf, {level: 9}).length,
    brotli: brotliCompressSync(buf, {
      params: {[constants.BROTLI_PARAM_QUALITY]: 11},
    }).length,
  };
}

function sumOf(files) {
  return files.reduce(
    (acc, f) => {
      const s = sizes(f);
      acc.raw += s.raw;
      acc.gzip += s.gzip;
      acc.brotli += s.brotli;
      acc.files += 1;
      return acc;
    },
    {raw: 0, gzip: 0, brotli: 0, files: 0}
  );
}

const result = {label, headless: {}, atomic: {}};

if (scope === 'all' || scope === 'headless') {
  const pkg = join(root, 'packages/headless');
  const bundles = [
    ...walk(join(pkg, 'cdn'), (p) => /headless(\.esm)?\.js$/.test(p)),
    ...walk(join(pkg, 'dist/cjs'), (p) => p.endsWith('headless.cjs')),
    ...walk(join(pkg, 'dist/quantic'), (p) => p.endsWith('headless.js')),
  ];
  for (const file of bundles.sort()) {
    result.headless[relative(pkg, file)] = sizes(file);
  }
  result.headless['dist/esm (all files)'] = sumOf(
    walk(join(pkg, 'dist/esm'), (p) => p.endsWith('.js'))
  );
}

if (scope === 'all' || scope === 'atomic') {
  const pkg = join(root, 'packages/atomic');
  const cdnJs = walk(join(pkg, 'cdn'), (p) => p.endsWith('.js') && !p.includes('/lang/'));
  for (const name of ['atomic.esm.js', 'index.js', 'index.esm.js']) {
    const file = join(pkg, 'cdn', name);
    try {
      result.atomic[`cdn/${name}`] = sizes(file);
    } catch {}
  }
  result.atomic['cdn (all js)'] = sumOf(cdnJs);
  result.atomic['dist/esm (all js)'] = sumOf(walk(join(pkg, 'dist/esm'), (p) => p.endsWith('.js')));
  result.atomic['dist/cjs (all js)'] = sumOf(walk(join(pkg, 'dist/cjs'), (p) => /\.c?js$/.test(p)));
}

mkdirSync(join(here, 'results'), {recursive: true});
writeFileSync(join(here, 'results', `${label}.json`), `${JSON.stringify(result, null, 2)}\n`);
console.info(`Wrote spike/KIT-6490/results/${label}.json`);
