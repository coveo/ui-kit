/**
 * Rewrites pkg.pr.new templates in the CI checkout so they install with npm in
 * StackBlitz, not just with pnpm in this workspace: resolves `catalog:` versions,
 * inlines the tsconfig `extends` chain, and drops test tooling.
 *
 * Takes the same glob `action.yml` hands to `pkg-pr-new --template`.
 */

import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

// A template only runs `dev`, so test tooling is unused. `vitest` also breaks the
// install outright: npm cannot resolve its dozen optional peers and fails with
// `Cannot read properties of null (reading 'edgesOut')`. pnpm handles it, so this
// only shows up in StackBlitz.
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
 * Collapses the `extends` chain into one self-contained file. A template is published
 * standalone, so extending the monorepo root resolves to nothing and Vite fails every
 * transform with `Tsconfig not found`. `compilerOptions` merge with the extending
 * config winning, as TypeScript does; other keys are not inherited, since `include`
 * and `exclude` are relative to the file declaring them.
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

  // `types` may name a package just removed (e.g. `vitest/globals`).
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
      // Exact, not `^`: the catalog pins exact versions, and a range let npm install
      // a schema prerelease the sample did not match, breaking every surface.
      configuration[name] = resolvedVersion;
      console.log(`${packageName}: resolved ${name} "catalog:" → "${resolvedVersion}"`);
      resolvedCount += 1;
    } else {
      // Publishing it verbatim would fail to install, so fail here instead.
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

  // Their tooling is gone, or they build sibling workspace packages (`dev:mock`).
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

/** Expands the glob the same way `pkg-pr-new` expands its own `--template`. */
function resolveTemplateDirectories(patterns) {
  if (patterns.length === 0) {
    throw new Error(
      'No template pattern given. Pass the same value the workflow hands to `pkg-pr-new --template`.'
    );
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
