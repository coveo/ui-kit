#!/usr/bin/env node
/**
 * Prints the changeset files at HEAD, one per line, by what the next `changeset version` does
 * with them.
 *
 * --to-version  the files it versions, then deletes.
 * --held        the files it keeps because they name a package that Changesets skips: one in
 *               the `ignore` list, such as the v4 packages on main until the v4 GA (KIT-6480),
 *               or a private package.
 *
 * The changeset action publishes only when it finds no changeset file at all, and the changeset
 * merge guard looks for files left after a version commit, so both need to tell the two apart.
 *
 * Usage: node changeset-files.mjs --to-version | --held
 */

import {execFileSync} from 'node:child_process';
import {parseArgs} from 'node:util';
import {readReleaseState, splitChangesets} from './changeset-major-guard.mjs';

const {values} = parseArgs({
  options: {'to-version': {type: 'boolean'}, held: {type: 'boolean'}},
});
if (Boolean(values['to-version']) === Boolean(values.held)) {
  console.error('Usage: node changeset-files.mjs --to-version | --held');
  process.exit(2);
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf8'}).trim();
const {held, toVersion} = splitChangesets(readReleaseState(root, 'HEAD'));
for (const file of values.held ? held : toVersion) {
  console.log(file);
}
