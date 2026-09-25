/**
 * Resolves `catalog:` protocol references in pkg.pr.new template package.json
 * files before publishing. The `catalog:` protocol is a pnpm workspace feature
 * that does not resolve outside the workspace (e.g. in StackBlitz).
 *
 * Accepts the same glob pattern that `.github/actions/publish-preview` hands to
 * `pkg-pr-new --template`, so there is a single source of truth for which
 * directories are templates and every published template gets flattened.
 *
 * See: https://github.com/stackblitz-labs/pkg.pr.new/issues/204
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultTemplateDirectory = path.resolve(__dirname, '..');

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
      configuration[name] = `^${resolvedVersion}`;
      console.log(`${packageName}: resolved ${name} "catalog:" → "^${resolvedVersion}"`);
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

  if (resolvedCount === 0) {
    console.log(`${packageName}: no "catalog:" references to resolve.`);
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
