// PROTOTYPE — turns rspack stats + page shapes into the solver's model.
// A module's "signature" is the set of pages whose components transitively import it (static
// imports only). Modules with the same signature form a group: the solver only decides which
// groups share a chunk. Modules in initial chunks load on every page and are left alone.
// usage: node analyze.mjs <buildDir> <pages.json> <model.json>
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';

const [buildDir, pagesPath, outPath, fitDir = buildDir] = process.argv.slice(2);
const stats = JSON.parse(readFileSync(join(buildDir, 'stats.json'), 'utf8'));
const {knownTags, pages} = JSON.parse(readFileSync(pagesPath, 'utf8'));

const DYNAMIC = /import\(\)|import context|^entry$|self exports|context element|new Worker/;
const modules = stats.modules.filter((m) => m.chunks?.length);
const byIdentifier = new Map(modules.map((m) => [m.identifier, m]));
for (const m of modules) for (const inner of m.modules ?? []) byIdentifier.set(inner.identifier, m);
const key = (m) => m.nameForCondition ?? m.identifier;

// always loaded on a page: the chunks of the atomic.esm entry; fixed but page-dependent: other
// initial chunks (index.esm's two small chunks), which the ADR keeps as they are
const initialChunks = new Set(stats.chunks.filter((c) => c.initial).map((c) => c.id));
const entryChunks = new Set(stats.entrypoints['atomic.esm'].chunks);
const isInitial = (m) => m.chunks.some((id) => entryChunks.has(id));
const isMovable = (m) => m.chunks.some((id) => !initialChunks.has(id)); // an async copy exists

const out = new Map(modules.map((m) => [m.identifier, new Set()]));
let unresolved = 0;
for (const m of modules) {
  for (const r of m.reasons ?? []) {
    if (DYNAMIC.test(r.type)) continue;
    const from = byIdentifier.get(r.moduleIdentifier);
    if (!from) {
      unresolved++;
      continue;
    }
    if (from !== m) out.get(from.identifier).add(m.identifier);
  }
}

const byResource = new Map(modules.map((m) => [key(m), m]));
const closureOf = new Map();
const closure = (tag) => {
  if (closureOf.has(tag)) return closureOf.get(tag);
  const root = byResource.get(knownTags[tag]);
  const seen = new Set();
  if (root) {
    const pending = [root.identifier];
    while (pending.length) {
      const id = pending.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      for (const next of out.get(id)) pending.push(next);
    }
  } else console.warn(`no module for ${tag}`);
  closureOf.set(tag, seen);
  return seen;
};

const usedBy = new Map(); // identifier -> Set(page index)
const fixedUsed = new Set();
pages.forEach((page, p) => {
  for (const tag of page.tags)
    for (const id of closure(tag)) {
      const m = byIdentifier.get(id);
      if (isInitial(m)) continue;
      if (!isMovable(m)) {
        fixedUsed.add(id);
        continue;
      }
      if (!usedBy.has(id)) usedBy.set(id, new Set());
      usedBy.get(id).add(p);
    }
});

// gz(bytes) ~= alpha + beta * raw size, fitted on this build's async chunks
const fitStats =
  fitDir === buildDir ? stats : JSON.parse(readFileSync(join(fitDir, 'stats.json'), 'utf8'));
const asyncChunks = fitStats.chunks.filter(
  (c) => !c.initial && c.files.some((f) => f.endsWith('.js'))
);
const pts = asyncChunks.map((c) => [
  c.size,
  c.files
    .filter((f) => f.endsWith('.js'))
    .reduce((a, f) => a + gzipSync(readFileSync(join(fitDir, f)), {level: 9}).length, 0),
]);
const n = pts.length,
  sx = pts.reduce((a, [x]) => a + x, 0),
  sy = pts.reduce((a, [, y]) => a + y, 0);
const sxx = pts.reduce((a, [x]) => a + x * x, 0),
  sxy = pts.reduce((a, [x, y]) => a + x * y, 0);
const beta = (n * sxy - sx * sy) / (n * sxx - sx * sx),
  alpha = (sy - beta * sx) / n;

const groups = new Map();
for (const [id, set] of usedBy) {
  const sig = [...set].sort((a, b) => a - b).join(',');
  if (!groups.has(sig))
    groups.set(sig, {pages: [...set].sort((a, b) => a - b), modules: [], rawSize: 0});
  const g = groups.get(sig);
  const m = byIdentifier.get(id);
  g.modules.push(key(m));
  g.rawSize += m.size;
}
const groupList = [...groups.values()]
  .sort((a, b) => b.rawSize - a.rawSize)
  .map((g, i) => ({gid: i, ...g}));
const asyncModules = modules.filter((m) => !isInitial(m));
const model = {
  buildDir,
  fit: {alpha, beta, chunks: n},
  pages: pages.map((p, i) => ({
    id: p.id,
    family: p.family,
    weight: 1,
    groups: groupList.filter((g) => g.pages.includes(i)).map((g) => g.gid),
  })),
  groups: groupList,
  baseline: Object.fromEntries(
    asyncModules.map((m) => [key(m), String(m.chunks.find((id) => !initialChunks.has(id)))])
  ),
  moduleSizes: Object.fromEntries(asyncModules.map((m) => [key(m), m.size])),
  modulePages: Object.fromEntries(
    asyncModules
      .filter((m) => usedBy.has(m.identifier))
      .map((m) => [key(m), [...usedBy.get(m.identifier)].sort((a, b) => a - b)])
  ),
  unusedModules: asyncModules
    .filter((m) => isMovable(m) && !usedBy.has(m.identifier))
    .map((m) => ({name: m.name, rawSize: m.size})),
  counts: {
    modules: modules.length,
    asyncModules: asyncModules.length,
    usedAsyncModules: usedBy.size,
    fixedUsedModules: fixedUsed.size,
    unresolvedReasons: unresolved,
  },
};
writeFileSync(outPath, JSON.stringify(model, null, 1));
console.log(
  `modules ${model.counts.modules}, not in the entry ${model.counts.asyncModules}, movable and used by some page ${usedBy.size}, fixed (index.esm chunks) ${fixedUsed.size}, unused ${model.unusedModules.length}, unresolved reasons ${unresolved}`
);
console.log(`gz ~= ${alpha.toFixed(0)} + ${beta.toFixed(3)} * raw  (over ${n} async chunks)`);
console.log(
  `${groupList.length} usage groups; largest: ${groupList
    .slice(0, 5)
    .map(
      (g) =>
        `#${g.gid} ${((g.rawSize * beta) / 1024).toFixed(1)} KB gz est, ${g.modules.length} modules, ${g.pages.length} pages`
    )
    .join(' | ')}`
);
console.log(
  `unused async modules (never reached from a page): ${model.unusedModules
    .slice(0, 12)
    .map((m) => m.name)
    .join(', ')}${model.unusedModules.length > 12 ? ' ...' : ''}`
);
