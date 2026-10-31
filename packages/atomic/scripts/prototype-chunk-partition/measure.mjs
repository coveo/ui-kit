// PROTOTYPE — what each page shape really downloads from a built CDN directory.
// Parses the compiled lazy-import table (tag -> chunk ids), maps chunk ids to files with the
// stats, gzips the files, and prices each page with the ADR-fitted cost model.
// usage: node measure.mjs <buildDir> <pages.json> <cost.json> [out.json]
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';

const [buildDir, pagesPath, costPath, outPath] = process.argv.slice(2);
const stats = JSON.parse(readFileSync(join(buildDir, 'stats.json'), 'utf8'));
const {pages} = JSON.parse(readFileSync(pagesPath, 'utf8'));
const cost = JSON.parse(readFileSync(costPath, 'utf8'));

const chunkFiles = new Map(
  stats.chunks.map((c) => [String(c.id), c.files.filter((f) => f.endsWith('.js'))])
);
const gzCache = new Map();
const gzOf = (f) => {
  if (!gzCache.has(f)) gzCache.set(f, gzipSync(readFileSync(join(buildDir, f)), {level: 9}).length);
  return gzCache.get(f);
};

const jsFiles = readdirSync(buildDir).filter((f) => f.endsWith('.js'));
const lazyFile = jsFiles.find((f) =>
  readFileSync(join(buildDir, f), 'utf8').includes('"atomic-search-interface":async')
);
if (!lazyFile) throw new Error('compiled lazy map not found');
const text = readFileSync(join(buildDir, lazyFile), 'utf8');
const loaders = new Map();
for (const m of text.matchAll(/"(atomic-[a-z0-9-]+)":async\(\)=>await (.*?)\.then\(/g)) {
  loaders.set(
    m[1],
    [...m[2].matchAll(/\.e\((\d+|"[^"]+")\)/g)].map((x) => x[1].replace(/"/g, ''))
  );
}
if (loaders.size < 200) throw new Error(`only ${loaders.size} loaders parsed from ${lazyFile}`);

const initialFiles = stats.entrypoints['atomic.esm'].chunks.flatMap((id) =>
  chunkFiles.get(String(id))
);
const initialGz = initialFiles.reduce((a, f) => a + gzOf(f), 0);
const price = (files, gzBytes) => cost.b_s_per_kb * (gzBytes / 1024) + cost.c_s_per_file * files;

const rows = [];
for (const page of pages) {
  const files = new Set(initialFiles);
  for (const tag of page.tags) {
    const ids = loaders.get(tag);
    if (!ids) {
      console.warn(`no loader for ${tag} (${page.id})`);
      continue;
    }
    for (const id of ids) for (const f of chunkFiles.get(id) ?? []) files.add(f);
  }
  const gzBytes = [...files].reduce((a, f) => a + gzOf(f), 0);
  rows.push({
    id: page.id,
    family: page.family,
    tags: page.tags.length,
    files: files.size,
    gzKb: gzBytes / 1024,
    cost_s: price(files.size, gzBytes),
  });
}
const mean = (k) => rows.reduce((a, r) => a + r[k], 0) / rows.length;
const summary = {
  build: buildDir,
  lazyFile,
  initialFiles,
  initialGzKb: initialGz / 1024,
  jsFiles: jsFiles.length,
  totalJsGzKb: jsFiles.reduce((a, f) => a + gzOf(f), 0) / 1024,
  meanFiles: mean('files'),
  meanGzKb: mean('gzKb'),
  meanCost_s: mean('cost_s'),
  rows,
};
if (outPath) writeFileSync(outPath, JSON.stringify(summary, null, 1));
console.log(
  `${buildDir}: ${jsFiles.length} js files, ${summary.totalJsGzKb.toFixed(1)} KB gz total; entry loads ${initialFiles.length} files / ${summary.initialGzKb.toFixed(1)} KB gz`
);
console.log(
  `mean over ${rows.length} pages: ${summary.meanFiles.toFixed(1)} files, ${summary.meanGzKb.toFixed(1)} KB gz, ${summary.meanCost_s.toFixed(3)} s modelled`
);
for (const r of rows)
  console.log(
    `${String(r.files).padStart(4)} files ${r.gzKb.toFixed(1).padStart(7)} KB ${r.cost_s.toFixed(3)} s  ${r.id}`
  );
