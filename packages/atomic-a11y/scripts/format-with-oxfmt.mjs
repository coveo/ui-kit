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
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Formats the file at `absolutePath` in place using oxfmt.
 *
 * @param {string} absolutePath - Absolute path to the file to format.
 */
export function formatWithOxfmt(absolutePath) {
  try {
    execFileSync('pnpm', ['exec', 'oxfmt', absolutePath], {
      cwd: REPO_ROOT,
      stdio: 'pipe',
    });
  } catch (error) {
    console.warn(
      `[format-with-oxfmt] Could not format ${absolutePath}: ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    );
  }
}
