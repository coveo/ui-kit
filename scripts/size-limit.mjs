#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {workspacesRoot} from './packages.mjs';

const REPORT_FILE = 'size-limit-report.json';

/**
 * @typedef SizeLimitResult
 * @property {string} name Formatted as `<package> - <scenario>`.
 * @property {boolean} passed
 * @property {number} size
 * @property {number} [sizeLimit]
 */

/**
 * @param {number | undefined} bytes
 */
function formatBytes(bytes) {
  if (bytes === undefined) {
    return '—';
  }
  return bytes < 1000 ? `${bytes} B` : `${(bytes / 1000).toFixed(2)} kB`;
}

/**
 * @param {SizeLimitResult[]} results
 */
function toMarkdownTable(results) {
  const rows = results.map(({name, size, sizeLimit}) => {
    const [packageName, ...scenario] = name.split(' - ');
    const percent = sizeLimit ? `${((size / sizeLimit) * 100).toFixed(1)}%` : '—';
    return [packageName, scenario.join(' - '), formatBytes(size), formatBytes(sizeLimit), percent];
  });
  return [
    '| package | scenario | size | limit | % |',
    '| --- | --- | ---: | ---: | ---: |',
    ...rows.map((cells) => `| ${cells.join(' | ')} |`),
  ].join('\n');
}

/**
 * Runs size-limit in the current package, saves its JSON report for the CI summary,
 * and prints the results as a table.
 */
function run() {
  if (!existsSync('.size-limit.json')) {
    console.error(
      'No .size-limit.json in the current directory. Run this from a package, e.g. `pnpm --filter @coveo/headless size`, or run `pnpm size` from the root.'
    );
    process.exit(1);
  }

  const require = createRequire(join(process.cwd(), 'package.json'));
  const packageJsonPath = require.resolve('size-limit/package.json');
  const binPath = join(dirname(packageJsonPath), require(packageJsonPath).bin);

  let output;
  try {
    output = execFileSync(process.execPath, [binPath, '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });
  } catch (error) {
    // size-limit exits with 1 but still prints its JSON report when a limit is exceeded.
    if (!error.stdout) {
      throw error;
    }
    output = error.stdout;
  }

  /** @type {SizeLimitResult[]} */
  const results = JSON.parse(output);
  writeFileSync(REPORT_FILE, `${JSON.stringify(results, null, 2)}\n`);
  console.info(toMarkdownTable(results));

  const failed = results.filter(({passed}) => !passed);
  if (failed.length > 0) {
    console.error(`\nSize limit exceeded: ${failed.map(({name}) => name).join(', ')}`);
    process.exitCode = 1;
  }
}

/**
 * Prints a Markdown table combining the reports of every package that ran size-limit.
 */
function summary() {
  const packagesDir = join(workspacesRoot, 'packages');
  const results = readdirSync(packagesDir)
    .map((dir) => join(packagesDir, dir, REPORT_FILE))
    .filter((file) => existsSync(file))
    .flatMap((file) => JSON.parse(readFileSync(file, 'utf8')));

  console.info('## Package sizes\n');
  console.info(results.length > 0 ? toMarkdownTable(results) : 'No size-limit reports found.');
}

const commands = {run, summary};
const command = commands[process.argv[2]];
if (!command) {
  console.error(`Usage: size-limit.mjs <${Object.keys(commands).join('|')}>`);
  process.exit(1);
}
command();
