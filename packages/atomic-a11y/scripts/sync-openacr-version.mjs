/**
 * sync-openacr-version.mjs
 *
 * Sets `product.version` in the committed openacr.yaml to the version of
 * @coveo/atomic, without re-running the a11y evaluation. `report_date` is kept
 * and `last_modified_date` is set to today.
 *
 * Run it with `a11y:sync-version`.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {syncOpenAcrVersionFile} from '../dist/index.js';
import {formatWithOxfmt} from './format-with-oxfmt.mjs';

const PKG_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const OPENACR_PATH = resolve(PKG_ROOT, 'reports/openacr.yaml');
const ATOMIC_PACKAGE_JSON = resolve(REPO_ROOT, 'packages/atomic/package.json');

const {version} = JSON.parse(readFileSync(ATOMIC_PACKAGE_JSON, 'utf8'));
const {changed, previousVersion} = await syncOpenAcrVersionFile(OPENACR_PATH, version);
if (!changed) {
  console.log(`[sync-openacr-version] openacr.yaml already targets Atomic ${version}.`);
  process.exit(0);
}

formatWithOxfmt(OPENACR_PATH);
console.log(
  `[sync-openacr-version] openacr.yaml now targets Atomic ${version} (was ${previousVersion}).`
);
