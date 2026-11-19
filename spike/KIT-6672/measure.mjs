// Usage: node measure.mjs <baseline repo> <branch repo>
// Bundles small consumer entries with esbuild (browser, ESM, minified) against the baseline packages
// and against the prototype packages, and reports minified/gzip sizes plus duplication checks.
import {createRequire} from 'node:module';
import {gzipSync} from 'node:zlib';
import {existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';

const [baseRoot, newRoot] = process.argv.slice(2).map((p) => resolve(p));
const require = createRequire(resolve(newRoot, 'packages/headless/package.json'));
const esbuild = require('esbuild');

const scenarios = [
  {
    name: 'search: defineSearchEngine + defineResultList + defineSearchBox',
    old: {
      dir: 'packages/headless-react',
      code: `export {defineSearchEngine, defineResultList, defineSearchBox} from '@coveo/headless/ssr-next';`,
    },
    new: {
      dir: 'packages/headless-ssr',
      code: `export {defineSearchEngine, defineResultList, defineSearchBox} from '@coveo/headless-ssr';`,
    },
  },
  {
    name: 'commerce: defineCommerceEngine + defineProductList',
    old: {
      dir: 'packages/headless-react',
      code: `export {defineCommerceEngine, defineProductList} from '@coveo/headless/ssr-commerce-next';`,
    },
    new: {
      dir: 'packages/headless-ssr',
      code: `export {defineCommerceEngine, defineProductList} from '@coveo/headless-ssr/commerce';`,
    },
  },
  {
    name: 'react commerce: defineCommerceEngine + defineProductList (react external)',
    old: {
      dir: 'packages/headless-react',
      code: `export {defineCommerceEngine, defineProductList} from '@coveo/headless-react/ssr-commerce-next';`,
    },
    new: {
      dir: 'packages/headless-ssr',
      code: `export {defineCommerceEngine, defineProductList} from '@coveo/headless-ssr/react/commerce';`,
    },
  },
  {
    name: 'mixed: SSR commerce + loadProductListingActions from @coveo/headless/commerce',
    old: {
      dir: 'packages/headless-react',
      code: `export {defineCommerceEngine, defineProductList} from '@coveo/headless/ssr-commerce-next'; export {loadProductListingActions} from '@coveo/headless/commerce';`,
    },
    new: {
      dir: 'packages/headless-ssr',
      code: `export {defineCommerceEngine, defineProductList} from '@coveo/headless-ssr/commerce'; export {loadProductListingActions} from '@coveo/headless/commerce';`,
    },
  },
  {
    name: 'full surface: export * from the commerce SSR entry',
    old: {
      dir: 'packages/headless-react',
      code: `export * from '@coveo/headless/ssr-commerce-next';`,
    },
    new: {dir: 'packages/headless-ssr', code: `export * from '@coveo/headless-ssr/commerce';`},
  },
  {
    name: 'full surface: export * from the search SSR entry',
    old: {dir: 'packages/headless-react', code: `export * from '@coveo/headless/ssr-next';`},
    new: {dir: 'packages/headless-ssr', code: `export * from '@coveo/headless-ssr';`},
  },
];

async function bundle(root, {dir, code}) {
  const out = await esbuild.build({
    stdin: {contents: code, resolveDir: resolve(root, dir), loader: 'js'},
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    define: {'process.env.NODE_ENV': '"production"'},
    logLevel: 'silent',
  });
  const text = out.outputFiles[0].text;
  const inputs = Object.keys(out.metafile.inputs);
  const headlessInputs = inputs.filter((i) => i.includes('packages/headless/dist/esm/'));
  const rel = headlessInputs.map((i) => i.slice(i.indexOf('packages/headless/dist/esm/')));
  return {
    min: text.length,
    gzip: gzipSync(text).length,
    stateKeyCopies: text.split('coveo-headless-internal-state').length - 1,
    headlessModules: headlessInputs.length,
    duplicatedHeadlessModules: rel.length - new Set(rel).size,
    cjsHeadlessBundles: inputs.filter((i) => i.includes('/dist/cjs/')).length,
  };
}

const kb = (n) => `${(n / 1000).toFixed(1)} kB`;
const rows = [];
for (const s of scenarios) {
  const o = await bundle(baseRoot, s.old);
  const n = await bundle(newRoot, s.new);
  rows.push({scenario: s.name, old: o, new: n, deltaGzip: n.gzip - o.gzip});
  console.log(
    `| ${s.name} | ${kb(o.min)} / ${kb(o.gzip)} | ${kb(n.min)} / ${kb(n.gzip)} | ${n.gzip - o.gzip >= 0 ? '+' : ''}${n.gzip - o.gzip} B | ${o.stateKeyCopies} / ${n.stateKeyCopies} | ${o.duplicatedHeadlessModules} / ${n.duplicatedHeadlessModules} |`
  );
}

const files = [
  'packages/headless/dist/cjs/ssr-next/headless.cjs',
  'packages/headless/dist/cjs/ssr-commerce-next/headless.cjs',
  'packages/headless/cdn/ssr-next/headless.esm.js',
  'packages/headless/cdn/ssr-commerce-next/headless.esm.js',
  'packages/headless/cdn/ssr-next/headless.js',
  'packages/headless/cdn/ssr-commerce-next/headless.js',
];
console.log('\nArtifacts removed from @coveo/headless (baseline size → prototype):');
for (const f of files) {
  const b = resolve(baseRoot, f);
  const n = resolve(newRoot, f);
  console.log(
    `- ${f}: ${existsSync(b) ? kb(statSync(b).size) : 'absent'} → ${existsSync(n) ? kb(statSync(n).size) : 'absent'}`
  );
}
