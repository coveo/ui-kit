/**
 * Prepares pkg.pr.new template package.json files for publishing, so they install
 * with npm in StackBlitz rather than only with pnpm inside this workspace.
 *
 * Two transformations:
 *
 * 1. Resolve `catalog:` references. The `catalog:` protocol is a pnpm workspace
 *    feature that does not resolve outside the workspace.
 *    See: https://github.com/stackblitz-labs/pkg.pr.new/issues/204
 *
 * 2. Drop test tooling. A template only ever runs its `dev` script in StackBlitz,
 *    so test runners are dead weight — and `vitest` is worse than dead weight: it
 *    declares a dozen optional peers (`jsdom`, `happy-dom`, `@vitest/ui`, …) and
 *    npm's dependency resolver crashes on that shape with
 *    `Cannot read properties of null (reading 'edgesOut')`, which takes the whole
 *    preview down. pnpm resolves it fine, which is why this only bites in
 *    StackBlitz. Removing test tooling also cuts the install to a fraction of its
 *    size.
 *
 * Accepts the same glob pattern that `.github/actions/publish-preview` hands to
 * `pkg-pr-new --template`, so there is a single source of truth for which
 * directories are templates and every published template gets the same treatment.
 */

import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultTemplateDirectory = path.resolve(__dirname, '..');

/**
 * Test tooling, removed from published templates. Exact names plus scope prefixes.
 * Anything needed to actually serve the app (`vite`, framework plugins, `typescript`,
 * `@types/*`) is deliberately absent from this list.
 */
const TEST_TOOLING = new Set(['vitest', 'playwright', '@playwright/test', 'fast-check']);
const TEST_TOOLING_PREFIXES = ['@testing-library/', '@vitest/'];

function isTestTooling(name) {
  return TEST_TOOLING.has(name) || TEST_TOOLING_PREFIXES.some((p) => name.startsWith(p));
}

/** Strips comments and trailing commas so a tsconfig can be parsed as JSON. */
function parseJsonc(source) {
  const withoutComments = source
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (match, comment) =>
      comment ? ' ' : match
    )
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(withoutComments);
}

/**
 * Collapses a tsconfig's `extends` chain into one self-contained file.
 *
 * Templates are published as a standalone directory, so a config that reaches
 * outside it — this sample extends the monorepo root, which in turn extends the
 * `@tsconfig/node22` package — resolves to nothing once published, and Vite fails
 * every transform with `Failed to load tsconfig: Tsconfig not found`.
 *
 * `compilerOptions` are merged with the extending config winning, matching
 * TypeScript. Other keys are taken from the extending config only, since `include`
 * and `exclude` are relative to the file that declares them.
 */
function flattenTsconfig(templateDirectory, removedDependencies) {
  const tsconfigPath = path.join(templateDirectory, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    return;
  }

  const require = createRequire(path.join(templateDirectory, 'noop.js'));
  const resolveExtends = (specifier, fromDirectory) =>
    specifier.startsWith('.') ? path.resolve(fromDirectory, specifier) : require.resolve(specifier);

  const read = (configPath) => {
    const config = parseJsonc(fs.readFileSync(configPath, 'utf8'));
    if (!config.extends) {
      return config;
    }

    const parent = read(resolveExtends(config.extends, path.dirname(configPath)));
    return {
      ...config,
      compilerOptions: {...parent.compilerOptions, ...config.compilerOptions},
    };
  };

  const flattened = read(tsconfigPath);
  if (!flattened.extends) {
    return;
  }

  delete flattened.extends;
  delete flattened.$schema;

  // `types` may name packages that were just removed (e.g. `vitest/globals`).
  const types = flattened.compilerOptions?.types;
  if (Array.isArray(types)) {
    flattened.compilerOptions.types = types.filter(
      (entry) => !removedDependencies.some((name) => entry === name || entry.startsWith(`${name}/`))
    );
  }

  fs.writeFileSync(tsconfigPath, `${JSON.stringify(flattened, null, 2)}\n`);
  console.log(`${path.basename(templateDirectory)}: inlined tsconfig "extends" chain`);
}

/** Removes test tooling from a dependency map, returning the names removed. */
function removeTestTooling(configuration) {
  if (!configuration) {
    return [];
  }

  const removed = Object.keys(configuration).filter(isTestTooling);
  for (const name of removed) {
    delete configuration[name];
  }

  return removed;
}

function listDependencies(packageDirectory) {
  const output = execFileSync('pnpm', ['ls', '--filter', '.', '--json', '--depth', '0'], {
    cwd: packageDirectory,
    encoding: 'utf8',
  });
  const [manifest] = JSON.parse(output);

  return {
    dependencies: manifest?.dependencies ?? {},
    devDependencies: manifest?.devDependencies ?? {},
  };
}

function resolveCatalogEntries(configuration, resolved, packageName) {
  if (!configuration) {
    return 0;
  }

  let resolvedCount = 0;
  for (const [name, version] of Object.entries(configuration)) {
    if (version !== 'catalog:') {
      continue;
    }

    const resolvedVersion = resolved[name]?.version;
    if (resolvedVersion) {
      // Pinned exactly, not as a `^` range: the workspace catalog pins exact
      // versions, so a range would let the template install a version the
      // workspace never tested. That is not hypothetical — `^1.0.0-beta.5` let npm
      // take `@coveo/thermidor-schema@1.0.0-beta.6`, whose contracts schema the
      // sample does not match, and every surface failed to resolve.
      configuration[name] = resolvedVersion;
      console.log(`${packageName}: resolved ${name} "catalog:" → "${resolvedVersion}"`);
      resolvedCount += 1;
    } else {
      // A `catalog:` reference we cannot resolve would be published verbatim and
      // fail to install in StackBlitz, so fail loudly here instead.
      throw new Error(
        `${packageName}: unable to resolve the "catalog:" version of ${name}. ` +
          'Run `pnpm install` so the workspace catalog is resolvable, then retry.'
      );
    }
  }

  return resolvedCount;
}

function flattenTemplate(templateDirectory) {
  const packagePath = path.join(templateDirectory, 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Not a template directory (no package.json): ${templateDirectory}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const packageName = packageJson.name ?? path.basename(templateDirectory);
  const {dependencies, devDependencies} = listDependencies(templateDirectory);

  const resolvedCount =
    resolveCatalogEntries(packageJson.dependencies, dependencies, packageName) +
    resolveCatalogEntries(packageJson.devDependencies, devDependencies, packageName);

  const removed = [
    ...removeTestTooling(packageJson.dependencies),
    ...removeTestTooling(packageJson.devDependencies),
  ];
  if (removed.length > 0) {
    console.log(`${packageName}: removed test tooling — ${removed.sort().join(', ')}`);
  }

  // Scripts that cannot run in a published template: their tooling is gone, or they
  // shell out to the monorepo (`dev:mock` builds sibling workspace packages).
  for (const script of ['test', 'e2e', 'e2e:watch', 'dev:mock']) {
    delete packageJson.scripts?.[script];
  }

  flattenTsconfig(templateDirectory, removed);

  if (resolvedCount === 0 && removed.length === 0) {
    console.log(`${packageName}: no manifest changes needed.`);
    return;
  }

  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

/**
 * Expands the template glob the workflow passes. Mirrors how `pkg-pr-new`
 * expands its own `--template` value, so both steps agree on the resulting set.
 */
function resolveTemplateDirectories(patterns) {
  if (patterns.length === 0) {
    return [defaultTemplateDirectory];
  }

  const matches = patterns.flatMap((pattern) => fs.globSync(pattern, {cwd: process.cwd()}));
  if (matches.length === 0) {
    throw new Error(`No template directories matched: ${patterns.join(' ')}`);
  }

  return [...new Set(matches)].sort().map((match) => path.resolve(match));
}

for (const templateDirectory of resolveTemplateDirectories(process.argv.slice(2))) {
  flattenTemplate(templateDirectory);
}
