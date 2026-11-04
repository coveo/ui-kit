/**
 * Rewrites pkg.pr.new templates in the CI checkout so they install with npm in
 * StackBlitz, not just with pnpm in this workspace: resolves `catalog:` versions,
 * inlines the tsconfig `extends` chain, drops test tooling, copies in the source
 * a template imports from a sibling sample, and drops workspace build steps.
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

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist']);
// Any quoted relative path, so `vi.mock('../x.js')` is rewritten along with imports.
const RELATIVE_SPECIFIER = /(['"])(\.\.?\/[^'"\n]+)\1/g;
const VENDOR_DIRECTORY = 'vendor';
// Configs of the test tooling removed above: inert in a template, and they may point
// into the monorepo (an alias to a workspace package's source).
const TEST_TOOLING_CONFIG = /^(vitest|playwright)\.|^vite\.config\.test\./;

function listSourceFiles(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : listSourceFiles(entryPath);
    }
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

function isInside(directory, target) {
  const relative = path.relative(directory, target);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function findPackageRoot(target) {
  for (let directory = path.dirname(target); ; directory = path.dirname(directory)) {
    if (fs.existsSync(path.join(directory, 'package.json'))) {
      return directory;
    }
    if (path.dirname(directory) === directory) {
      return undefined;
    }
  }
}

function toSpecifier(fromFile, target) {
  const relative = path.relative(path.dirname(fromFile), target).split(path.sep).join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

/**
 * Copies the sibling-package source a template imports by relative path into
 * `vendor/<package>/`, points those imports at the copy, and adds the sibling's
 * runtime dependencies. A template is published alone, so a path out of its
 * directory (demo-multi-surface-react reuses demo-schema-react's components
 * this way) resolves to nothing. The sample's own source stays untouched.
 */
function vendorSiblingSources(templateDirectory, packageJson, packageName) {
  const vendored = new Map();

  const files = listSourceFiles(templateDirectory).filter(
    (file) => !TEST_TOOLING_CONFIG.test(path.basename(file))
  );
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const rewritten = source.replace(RELATIVE_SPECIFIER, (match, quote, specifier) => {
      const target = path.resolve(path.dirname(file), specifier);
      if (isInside(templateDirectory, target)) {
        return match;
      }

      const packageRoot = findPackageRoot(target);
      const [topDirectory] = packageRoot ? path.relative(packageRoot, target).split(path.sep) : [];
      if (!packageRoot || isInside(packageRoot, templateDirectory) || !topDirectory) {
        throw new Error(
          `${packageName}: ${path.relative(templateDirectory, file)} imports "${specifier}", ` +
            'which is outside the template and not inside a sibling package.'
        );
      }

      const vendorRoot = path.join(templateDirectory, VENDOR_DIRECTORY, path.basename(packageRoot));
      const directories = vendored.get(packageRoot) ?? new Set();
      directories.add(topDirectory);
      vendored.set(packageRoot, directories);

      const copy = path.join(vendorRoot, path.relative(packageRoot, target));
      return `${quote}${toSpecifier(file, copy)}${quote}`;
    });

    if (rewritten !== source) {
      fs.writeFileSync(file, rewritten);
    }
  }

  for (const [packageRoot, directories] of vendored) {
    const vendorRoot = path.join(templateDirectory, VENDOR_DIRECTORY, path.basename(packageRoot));
    for (const directory of directories) {
      fs.cpSync(path.join(packageRoot, directory), path.join(vendorRoot, directory), {
        recursive: true,
        filter: (source) => !SKIPPED_DIRECTORIES.has(path.basename(source)),
      });
    }

    const copied = [...directories].map((directory) => path.join(vendorRoot, directory));
    for (const file of copied.flatMap(listSourceFiles)) {
      for (const [, , specifier] of fs.readFileSync(file, 'utf8').matchAll(RELATIVE_SPECIFIER)) {
        const target = path.resolve(path.dirname(file), specifier);
        if (!copied.some((directory) => isInside(directory, target))) {
          throw new Error(
            `${packageName}: vendored ${path.relative(templateDirectory, file)} imports ` +
              `"${specifier}", which was not copied with it.`
          );
        }
      }
    }

    mergeSiblingDependencies(packageJson, packageRoot, packageName);
    console.log(
      `${packageName}: vendored ${path.basename(packageRoot)}/{${[...directories].join(',')}} ` +
        `into ${VENDOR_DIRECTORY}/ and rewrote the imports`
    );
  }
}

/**
 * Adds the sibling's runtime dependencies the vendored source needs. Its `catalog:`
 * entries are resolved against the sibling here, since the template's own catalog
 * resolution only knows the template's dependency tree.
 */
function mergeSiblingDependencies(packageJson, packageRoot, packageName) {
  const sibling = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const {dependencies: resolved} = listDependencies(packageRoot);
  packageJson.dependencies ??= {};

  for (const [name, version] of Object.entries(sibling.dependencies ?? {})) {
    const existing = packageJson.dependencies[name];
    if (existing !== undefined) {
      if (existing !== version) {
        throw new Error(
          `${packageName}: needs ${name}@"${existing}", but vendored ${sibling.name} needs "${version}".`
        );
      }
      continue;
    }

    const resolvedVersion = version === 'catalog:' ? resolved[name]?.version : version;
    if (!resolvedVersion) {
      throw new Error(`${packageName}: unable to resolve ${sibling.name}'s ${name}@"${version}".`);
    }
    packageJson.dependencies[name] = resolvedVersion;
    console.log(`${packageName}: added ${name}@"${resolvedVersion}" for vendored ${sibling.name}`);
  }
}

// A template has no workspace packages to build first; pkg.pr.new installs them prebuilt.
const WORKSPACE_BUILD_PREFIX = /^turbo run build\b[^&]*&&\s*/;

function removeWorkspaceBuilds(scripts, packageName) {
  let changed = false;
  for (const [name, command] of Object.entries(scripts ?? {})) {
    const stripped = command.replace(WORKSPACE_BUILD_PREFIX, '');
    if (stripped !== command) {
      scripts[name] = stripped;
      changed = true;
      console.log(`${packageName}: removed the workspace build from "${name}"`);
    }
  }
  return changed;
}

function flattenTemplate(templateDirectory) {
  const packagePath = path.join(templateDirectory, 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Not a template directory (no package.json): ${templateDirectory}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const packageName = packageJson.name ?? path.basename(templateDirectory);
  const {dependencies, devDependencies} = listDependencies(templateDirectory);
  const dependenciesBefore = JSON.stringify(packageJson.dependencies);

  // Before catalog resolution, which would make the template's `catalog:` entries
  // look different from the identical ones of the sibling.
  vendorSiblingSources(templateDirectory, packageJson, packageName);
  const vendored = JSON.stringify(packageJson.dependencies) !== dependenciesBefore;

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

  const scriptsChanged = removeWorkspaceBuilds(packageJson.scripts, packageName);

  flattenTsconfig(templateDirectory, removed);

  if (resolvedCount === 0 && removed.length === 0 && !vendored && !scriptsChanged) {
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
