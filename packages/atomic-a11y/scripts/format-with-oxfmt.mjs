/**
 * format-with-oxfmt.mjs
 *
 * Formats a generated file with the repo's oxfmt so its output matches the
 * formatter enforced by CI (`oxfmt --check .`). The OpenACR YAML is produced by
 * `yaml.stringify`, whose line-wrapping differs from oxfmt; without this step
 * the committed file fails the lint check.
 *
 * Used by every path that generates openacr.yaml (update-openacr, json-to-openacr)
 * and by the drift check, so the committed file and the freshly-generated
 * comparison file are always formatted identically.
 */
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';

// Resolve oxfmt's executable from its own package metadata. `require.resolve`
// walks up to the workspace root where oxfmt is installed and follows pnpm's
// store symlinks, so this works regardless of hoisting layout.
const require = createRequire(import.meta.url);
const oxfmtPkgPath = require.resolve('oxfmt/package.json');
const oxfmtPkg = require('oxfmt/package.json');
const oxfmtBin = join(
  dirname(oxfmtPkgPath),
  typeof oxfmtPkg.bin === 'string' ? oxfmtPkg.bin : oxfmtPkg.bin.oxfmt
);

/**
 * Formats the file at `absolutePath` in place using oxfmt.
 *
 * oxfmt's bin is a Node script, so it is invoked directly with the current
 * `node` binary (`process.execPath`). This is the same CLI that `lint:check`
 * runs (`oxfmt --check .`), guaranteeing identical output, while avoiding a
 * dependency on `pnpm` being resolvable on PATH.
 *
 * `execFileSync` (not `execSync`) passes arguments as an array without a shell,
 * preventing command injection from the path. Failures are non-fatal: the
 * unformatted file is still valid YAML, so we warn and continue.
 *
 * @param {string} absolutePath - Absolute path to the file to format.
 */
export function formatWithOxfmt(absolutePath) {
  try {
    execFileSync(process.execPath, [oxfmtBin, absolutePath], {stdio: 'pipe'});
  } catch (error) {
    console.warn(
      `[format-with-oxfmt] Could not format ${absolutePath}: ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    );
  }
}
