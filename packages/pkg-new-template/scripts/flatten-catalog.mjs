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

const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const viteVersion = execSync('pnpm list vite --json --depth 0', {
  cwd: path.dirname(pkgPath),
  encoding: 'utf8',
});
const resolved = JSON.parse(viteVersion)[0].devDependencies.vite.version;

pkgJson.devDependencies.vite = resolved;
fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');

console.log(`Resolved vite "catalog:" → "${resolved}"`);
