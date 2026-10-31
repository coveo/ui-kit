// PROTOTYPE — collects "page shapes": the set of Atomic tags each known page uses.
// Sources: Storybook sample pages, atomic-cdn-smoke pages, the samples/atomic apps,
// plus the ADR 0001 "search box alone" shape. Writes pages.json next to the stats.
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const atomicDir = resolve(here, '../..');
const repoRoot = resolve(atomicDir, '../..');
const outPath = process.argv[2] ?? join(here, 'pages.json');

const KEBAB = /<(atomic-[a-z0-9-]+)(?=[\s>/])/g;
const PASCAL = /<(Atomic[A-Z][A-Za-z0-9]*)(?=[\s>/])/g;
const toKebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function* walk(dir, filter) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!/node_modules|playwright-report|publish|dist|\.angular/.test(entry.name))
        yield* walk(p, filter);
    } else if (filter(p)) yield p;
  }
}
const isTemplate = (p) =>
  (/\.(html|tsx|jsx|vue)$/.test(p) && !/\.(stories|spec|e2e)\./.test(p)) ||
  p.endsWith('.new.stories.tsx');

function tagsIn(files) {
  const tags = new Set();
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(KEBAB)) tags.add(m[1]);
    for (const m of text.matchAll(PASCAL)) tags.add(toKebab(m[1]));
  }
  return tags;
}

// tag -> absolute .ts path of the lazily imported component module
const knownTags = {};
for (const group of readdirSync(join(atomicDir, 'src/components'), {withFileTypes: true})) {
  if (!group.isDirectory()) continue;
  const lazy = join(atomicDir, 'src/components', group.name, 'lazy-index.ts');
  let text;
  try {
    text = readFileSync(lazy, 'utf8');
  } catch {
    continue;
  }
  for (const m of text.matchAll(
    /'(atomic-[a-z0-9-]+)':\s*async \(\) => await import\('([^']+)'\)/g
  )) {
    knownTags[m[1]] = resolve(dirname(lazy), m[2].replace(/\.js$/, '.ts'));
  }
}

const pages = [];
const add = (id, family, files) => {
  const all = tagsIn(files);
  const tags = [...all].filter((t) => knownTags[t]).sort();
  const unknownTags = [...all].filter((t) => !knownTags[t]).sort();
  pages.push({id, family, tags, unknownTags, files: files.map((f) => relative(repoRoot, f))});
};

for (const f of walk(join(atomicDir, 'storybook-pages'), (p) => p.endsWith('.new.stories.tsx'))) {
  add(
    `storybook/${relative(join(atomicDir, 'storybook-pages'), f).replace('.new.stories.tsx', '')}`,
    'storybook',
    [f]
  );
}
for (const f of walk(join(repoRoot, 'packages/atomic-cdn-smoke/pages'), (p) =>
  p.endsWith('.html')
)) {
  add(
    `cdn-smoke/${relative(join(repoRoot, 'packages/atomic-cdn-smoke/pages'), f).replace('.html', '')}`,
    'cdn-smoke',
    [f]
  );
}
const samples = join(repoRoot, 'samples/atomic');
for (const app of readdirSync(samples, {withFileTypes: true})) {
  if (!app.isDirectory()) continue;
  const dir = join(samples, app.name);
  const htmlPages = readdirSync(dir)
    .filter((n) => n.endsWith('.html'))
    .map((n) => join(dir, n));
  const srcFiles = statSync(join(dir, 'src'), {throwIfNoEntry: false})
    ? [...walk(join(dir, 'src'), isTemplate)]
    : [];
  // React apps: one shape per route page; Angular apps: one shape per *-page component
  const isRoute = (f) => /[\\/]pages[\\/]/.test(f) || f.endsWith('-page.component.html');
  const pageFiles = srcFiles.filter(isRoute);
  const sharedFiles = srcFiles.filter((f) => !isRoute(f));
  if (pageFiles.length > 0) {
    for (const f of pageFiles)
      add(
        `sample/${app.name}/${f
          .split(/[\\/]/)
          .pop()
          .replace(/(\.component)?\.\w+$/, '')}`,
        'sample',
        [...htmlPages, ...sharedFiles, f]
      );
  } else if (htmlPages.length > 1) {
    for (const f of htmlPages)
      add(`sample/${app.name}/${relative(dir, f).replace('.html', '')}`, 'sample', [
        f,
        ...sharedFiles,
      ]);
  } else {
    add(`sample/${app.name}`, 'sample', [...htmlPages, ...sharedFiles]);
  }
}
pages.push({
  id: 'adr/search-box-only',
  family: 'adr',
  tags: ['atomic-search-box', 'atomic-search-interface'],
  unknownTags: [],
  files: [],
});

const kept = pages.filter((p) => p.tags.length > 0);
writeFileSync(outPath, JSON.stringify({knownTags, pages: kept}, null, 1));
console.log(
  `${kept.length} pages (${pages.length - kept.length} empty dropped), ${Object.keys(knownTags).length} known tags -> ${outPath}`
);
for (const p of kept)
  console.log(
    `${String(p.tags.length).padStart(3)} tags  ${p.id}${p.unknownTags.length ? `   unknown: ${p.unknownTags.join(' ')}` : ''}`
  );
