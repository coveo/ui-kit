/**
 * Resolves `catalog:` protocol references in pkg.pr.new template package.json
 * files before publishing. The `catalog:` protocol is a pnpm workspace feature
 * that does not resolve outside the workspace (e.g. in StackBlitz).
 *
 * See: https://github.com/stackblitz-labs/pkg.pr.new/issues/204
 */

import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, '../package.json');
const pkgDir = path.dirname(pkgPath);

const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function listDependencies() {
  const output = execSync(
    `pnpm ls --filter . --json --depth 0 | jq '.[0] | {dependencies, devDependencies}'`,
    {
      cwd: pkgDir,
      encoding: 'utf8',
    }
  );

  return JSON.parse(output);
}

function resolveCatalogEntries(configuration, resolved) {
  if (!configuration) return;

  for (const [name, version] of Object.entries(configuration)) {
    if (version !== 'catalog:') continue;

    const resolvedVersion = resolved[name]?.version;
    if (resolvedVersion) {
      configuration[name] = `^${resolvedVersion}`;
      console.log(`Resolved ${name} "catalog:" → "^${resolvedVersion}"`);
    }
  }
}

const {dependencies, devDependencies} = listDependencies();

resolveCatalogEntries(pkgJson.dependencies, dependencies);
resolveCatalogEntries(pkgJson.devDependencies, devDependencies);

fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
