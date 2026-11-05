import {readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';

const KEBAB_TAG = /<(atomic-[a-z0-9-]+)(?=[\s>/])/g;
const PASCAL_TAG = /<(Atomic[A-Z][A-Za-z0-9]*)(?=[\s>/])/g;
const LAZY_IMPORT = /'(atomic-[a-z0-9-]+)':\s*async \(\) => await import\('([^']+)'\)/g;
const SKIPPED_DIRECTORY = /^(node_modules|playwright-report|publish|dist|dist-.*|\.angular)$/;

const toKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const toPosix = (path) => path.split(sep).join('/');
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const entriesOf = (directory) =>
  readdirSync(directory, {withFileTypes: true}).sort((a, b) => compare(a.name, b.name));

function* walk(directory, keep) {
  for (const entry of entriesOf(directory)) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORY.test(entry.name)) {
        yield* walk(path, keep);
      }
    } else if (keep(path)) {
      yield path;
    }
  }
}

const isMarkup = (path) =>
  (/\.(html|tsx|jsx|vue)$/.test(path) && !/\.(stories|spec|e2e)\./.test(path)) ||
  path.endsWith('.new.stories.tsx');

function tagsIn(files) {
  const tags = new Set();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(KEBAB_TAG)) {
      tags.add(match[1]);
    }
    for (const match of text.matchAll(PASCAL_TAG)) {
      tags.add(toKebab(match[1]));
    }
  }
  return tags;
}

/** @returns {Record<string, string>} tag -> absolute path of the module the lazy loader imports for it */
function lazyComponents(atomicDir) {
  const components = {};
  const componentsDir = join(atomicDir, 'src/components');
  for (const group of entriesOf(componentsDir)) {
    const lazyIndex = join(componentsDir, group.name, 'lazy-index.ts');
    if (!group.isDirectory() || !statSync(lazyIndex, {throwIfNoEntry: false})) {
      continue;
    }
    for (const match of readFileSync(lazyIndex, 'utf8').matchAll(LAZY_IMPORT)) {
      components[match[1]] = resolve(dirname(lazyIndex), match[2].replace(/\.js$/, '.ts'));
    }
  }
  return components;
}

/**
 * Collects the page shapes the partition is computed for: the Atomic tags each page uses, read from
 * the Storybook sample pages, the CDN smoke-test pages and the sample applications, plus a page
 * with nothing but a search box, the smallest Atomic page and the one sites put everywhere.
 */
export function collectPageShapes(atomicDir) {
  const repoRoot = resolve(atomicDir, '../..');
  const knownTags = lazyComponents(atomicDir);
  if (Object.keys(knownTags).length === 0) {
    throw new Error(
      `No lazy-index.ts under ${join(atomicDir, 'src/components')}: run build:indexes first.`
    );
  }
  const pages = [];
  const add = (id, files) => {
    const tags = [...tagsIn(files)].filter((tag) => tag in knownTags).sort(compare);
    if (tags.length > 0) {
      pages.push({id: toPosix(id), tags});
    }
  };

  const storybookPages = join(atomicDir, 'storybook-pages');
  for (const file of walk(storybookPages, (path) => path.endsWith('.new.stories.tsx'))) {
    add(`storybook/${relative(storybookPages, file).replace('.new.stories.tsx', '')}`, [file]);
  }

  const smokePages = join(repoRoot, 'packages/atomic-cdn-smoke/pages');
  for (const file of walk(smokePages, (path) => path.endsWith('.html'))) {
    add(`cdn-smoke/${relative(smokePages, file).replace('.html', '')}`, [file]);
  }

  const samples = join(repoRoot, 'samples/atomic');
  for (const app of entriesOf(samples)) {
    if (!app.isDirectory()) {
      continue;
    }
    const directory = join(samples, app.name);
    const htmlPages = readdirSync(directory)
      .filter((name) => name.endsWith('.html'))
      .sort(compare)
      .map((name) => join(directory, name));
    const source = join(directory, 'src');
    const sourceFiles = statSync(source, {throwIfNoEntry: false})
      ? [...walk(source, isMarkup)]
      : [];
    // One shape per route of a React app or per page component of an Angular app, each with the
    // files every route shares (layouts, headers); otherwise one shape per HTML page.
    const isRoute = (path) => /[\\/]pages[\\/]/.test(path) || path.endsWith('-page.component.html');
    const routes = sourceFiles.filter(isRoute);
    const shared = sourceFiles.filter((path) => !isRoute(path));
    if (routes.length > 0) {
      for (const route of routes) {
        const name = relative(source, route).replace(/(\.component)?\.\w+$/, '');
        add(`sample/${app.name}/${name}`, [...htmlPages, ...shared, route]);
      }
    } else if (htmlPages.length > 1) {
      for (const page of htmlPages) {
        add(`sample/${app.name}/${relative(directory, page).replace('.html', '')}`, [
          page,
          ...shared,
        ]);
      }
    } else {
      add(`sample/${app.name}`, [...htmlPages, ...shared]);
    }
  }

  pages.push({id: 'search-box-only', tags: ['atomic-search-box', 'atomic-search-interface']});
  pages.sort((a, b) => compare(a.id, b.id));
  return {knownTags, pages};
}
