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

function resolveCatalogEntries(deps) {
  if (!deps) return;
  for (const [name, version] of Object.entries(deps)) {
    if (version !== 'catalog:') continue;
    const output = execSync(`pnpm list ${name} --json --depth 0`, {
      cwd: pkgDir,
      encoding: 'utf8',
    });
    const parsed = JSON.parse(output)[0];
    const resolved =
      parsed.dependencies?.[name]?.version ||
      parsed.devDependencies?.[name]?.version;
    if (resolved) {
      deps[name] = `^${resolved}`;
      console.log(`Resolved ${name} "catalog:" → "^${resolved}"`);
    }
  }
}

resolveCatalogEntries(pkgJson.dependencies);
resolveCatalogEntries(pkgJson.devDependencies);

fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
