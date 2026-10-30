#!/usr/bin/env node
/**
 * Checks a UI-Kit v4 story branch before it becomes a pull request:
 *   - a public package whose source changed has a changeset,
 *   - the changeset bumps match the track (v3: no major, v4: at least one major, experimental: no major),
 *   - a major bump comes with an upgrade guide entry,
 *   - guide entries and changesets do not point customers at an experimental entry point,
 *   - new deprecation notices name a replacement.
 *
 * Usage:
 *   node check-v4-change.mjs [--base origin/main] [--track v3|v4|experimental]
 *
 * Compares the working tree (including untracked files) with the merge base of HEAD and --base.
 * Exits 1 on a failure; warnings do not fail the check. A branch with no changeset and no public
 * source change (docs only, tests only) passes on every track, including --track v4.
 */

import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseArgs} from 'node:util';

const GUIDE_FILES = [
  'packages/headless/source_docs/upgrade-from-v3-to-v4.md',
  'packages/headless-react/source_docs/upgrade-from-v3-to-v4.md',
  'packages/atomic/docs/upgrade-from-v3-to-v4.md',
];
const EXPERIMENTAL_ENTRY_POINTS = /ssr-next|ssr-commerce-next/;

const {values: options} = parseArgs({
  options: {
    base: {type: 'string', default: 'origin/main'},
    track: {type: 'string'},
  },
});

const root = git('rev-parse', '--show-toplevel');
const mergeBase = git('merge-base', options.base, 'HEAD');

const changed = new Map();
for (const line of git('diff', '--name-status', mergeBase).split('\n').filter(Boolean)) {
  const [status, ...rest] = line.split('\t');
  changed.set(rest[rest.length - 1], status[0]);
}
for (const file of git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean)) {
  changed.set(file, 'A');
}

const failures = [];
const warnings = [];

const changesets = [...changed.keys()].filter(
  (file) => /^\.changeset\/[^/]+\.md$/.test(file) && !file.endsWith('README.md') && changed.get(file) === 'A'
);
const bumps = changesets.flatMap((file) => parseBumps(file));

const publicPackagesChanged = new Set();
for (const file of changed.keys()) {
  const match = /^packages\/([^/]+)\/src\//.exec(file);
  if (!match || isTestOrDoc(file)) continue;
  const manifest = join(root, 'packages', match[1], 'package.json');
  if (!existsSync(manifest)) continue;
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  if (!pkg.private) publicPackagesChanged.add(pkg.name);
}

for (const name of publicPackagesChanged) {
  if (!bumps.some((bump) => bump.name === name || sharesFixedGroup(bump.name, name))) {
    failures.push(`${name} source changed without a changeset (run pnpm changeset)`);
  }
}

const hasMajor = bumps.some((bump) => bump.level === 'major');
const track = options.track ?? (hasMajor ? 'v4' : 'v3');
if (!['v3', 'v4', 'experimental'].includes(track)) {
  failures.push(`unknown track "${track}": use v3, v4 or experimental`);
}
if (track === 'v4' && !hasMajor && bumps.length > 0) {
  failures.push('track v4 but no changeset bumps major');
}
if (track !== 'v4' && hasMajor) {
  failures.push(`track ${track} but a changeset bumps major: ${bumps.filter((b) => b.level === 'major').map((b) => b.name).join(', ')}`);
}

const guideTouched = GUIDE_FILES.filter((file) => changed.has(file));
if (hasMajor && guideTouched.length === 0) {
  failures.push(`a major bump needs an upgrade guide entry in one of: ${GUIDE_FILES.join(', ')}`);
}

for (const file of guideTouched) {
  for (const line of addedLines(file)) {
    if (EXPERIMENTAL_ENTRY_POINTS.test(line)) {
      failures.push(`${file} points at an experimental entry point: ${line.trim()}`);
    }
  }
}
for (const file of changesets) {
  for (const line of addedLines(file)) {
    if (EXPERIMENTAL_ENTRY_POINTS.test(line)) {
      warnings.push(`${file} names an experimental entry point; write "the experimental SSR sub-package" instead`);
    }
  }
}

for (const file of changed.keys()) {
  if (!/^packages\/[^/]+\/src\//.test(file) || isTestOrDoc(file)) continue;
  for (const line of addedLines(file)) {
    if (line.includes('@deprecated') && !/instead|use `/i.test(line)) {
      warnings.push(`${file}: a deprecation notice should name the replacement ("Use \`x\` instead"): ${line.trim()}`);
    }
  }
}

if (hasMajor) {
  const subjects = git('log', '--format=%s', `${mergeBase}..HEAD`).split('\n').filter(Boolean);
  if (subjects.length > 0 && !subjects.some((subject) => /^[a-z]+(\([^)]*\))?!:/.test(subject))) {
    warnings.push('a major bump usually comes with a breaking commit title, for example "feat(headless)!: ..."');
  }
}

console.log(`track: ${track}`);
console.log(`changesets: ${changesets.length ? bumps.map((b) => `${b.name} ${b.level}`).join(', ') : 'none'}`);
console.log(`public packages with source changes: ${[...publicPackagesChanged].join(', ') || 'none'}`);
console.log(`upgrade guide touched: ${guideTouched.join(', ') || 'no'}`);
for (const warning of warnings) console.log(`warning: ${warning}`);
for (const failure of failures) console.log(`FAIL: ${failure}`);
console.log(failures.length ? `${failures.length} failure(s)` : 'ok');
process.exitCode = failures.length ? 1 : 0;

function git(...args) {
  return execFileSync('git', args, {cwd: process.cwd(), encoding: 'utf8'}).trim();
}

function parseBumps(file) {
  const text = readFileSync(join(root, file), 'utf8');
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!frontmatter) return [];
  return frontmatter[1]
    .split('\n')
    .map((line) => /^['"]?([^'":]+)['"]?\s*:\s*(major|minor|patch)/.exec(line.trim()))
    .filter(Boolean)
    .map((match) => ({name: match[1], level: match[2]}));
}

function sharesFixedGroup(bumped, changedName) {
  const config = JSON.parse(readFileSync(join(root, '.changeset/config.json'), 'utf8'));
  return (config.fixed ?? []).some((group) => group.includes(bumped) && group.includes(changedName));
}

function isTestOrDoc(file) {
  return /\.(test|spec|test-d)\.[cm]?[jt]sx?$|\.stories\.|__tests__\/|\/test\/|\.md$/.test(file);
}

function addedLines(file) {
  if (changed.get(file) === 'A' && !git('ls-files', '--', file)) {
    return readFileSync(join(root, file), 'utf8').split('\n');
  }
  return git('diff', '-U0', mergeBase, '--', file)
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1));
}
