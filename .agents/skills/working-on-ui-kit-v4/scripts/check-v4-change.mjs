#!/usr/bin/env node
/**
 * Checks a UI-Kit v4 story branch before it becomes a pull request:
 *   - a public package whose source changed has a changeset,
 *   - the changeset bumps match the track (v3: no major, v4: at least one major, experimental: no major,
 *     no-release: no changeset and no published source change),
 *   - a major bump comes with an upgrade guide entry,
 *   - guide entries and changesets do not point customers at an experimental entry point,
 *   - new deprecation notices name a replacement.
 *
 * Usage:
 *   node .agents/skills/working-on-ui-kit-v4/scripts/check-v4-change.mjs [--base origin/main] [--track v3|v4|experimental|no-release]   (run from the repository root)
 *
 * Compares the working tree (including untracked files) with the merge base of HEAD and --base.
 * Exits 1 on a failure; warnings do not fail the check. Without --track, a major changeset means v4
 * and anything else means v3. A docs-only or tests-only branch passes on every track.
 */

import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseArgs} from 'node:util';

const HEADLESS_GUIDE = 'packages/headless/source_docs/upgrade-from-v3-to-v4.md';
const HEADLESS_REACT_GUIDE = 'packages/headless-react/source_docs/upgrade-from-v3-to-v4.md';
const ATOMIC_GUIDE = 'packages/atomic/upgrade-from-v3-to-v4.md';
const GUIDE_FILES = [HEADLESS_GUIDE, HEADLESS_REACT_GUIDE, ATOMIC_GUIDE];
const GUIDE_BY_PACKAGE = {
  '@coveo/headless': HEADLESS_GUIDE,
  '@coveo/headless-react': HEADLESS_REACT_GUIDE,
  '@coveo/atomic': ATOMIC_GUIDE,
  '@coveo/atomic-react': ATOMIC_GUIDE,
  '@coveo/atomic-angular': ATOMIC_GUIDE,
};
const PUBLISHED_SOURCE_ROOTS = ['src/', 'force-app/main/default/'];
const EXPERIMENTAL_ENTRY_POINTS = /ssr-next|ssr-commerce-next/;
const TRACKS = ['v3', 'v4', 'experimental', 'no-release'];

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
const publishedSourceFiles = [];
for (const file of changed.keys()) {
  if (isTestOrDoc(file)) continue;
  const name = publishedPackageOf(file);
  if (!name) continue;
  publicPackagesChanged.add(name);
  publishedSourceFiles.push(file);
}

const hasMajor = bumps.some((bump) => bump.level === 'major');
const track = options.track ?? (hasMajor ? 'v4' : 'v3');
if (!TRACKS.includes(track)) {
  failures.push(`unknown track "${track}": use ${TRACKS.join(', ')}`);
}

if (track === 'no-release') {
  if (changesets.length > 0) {
    failures.push(`track no-release but the branch adds a changeset: ${changesets.join(', ')}`);
  }
  if (publicPackagesChanged.size > 0) {
    failures.push(`track no-release but published source changed in: ${[...publicPackagesChanged].join(', ')}`);
  }
} else {
  for (const name of publicPackagesChanged) {
    if (!bumps.some((bump) => bump.name === name || sharesFixedGroup(bump.name, name))) {
      failures.push(`${name} source changed without a changeset (run pnpm changeset)`);
    }
  }
  if (track === 'v4' && !hasMajor && bumps.length > 0) {
    failures.push('track v4 but no changeset bumps major');
  }
  if (track !== 'v4' && hasMajor) {
    failures.push(`track ${track} but a changeset bumps major: ${bumps.filter((b) => b.level === 'major').map((b) => b.name).join(', ')}`);
  }
}

const guideTouched = GUIDE_FILES.filter((file) => changed.has(file) && changed.get(file) !== 'D');
for (const file of GUIDE_FILES.filter((guide) => changed.get(guide) === 'D')) {
  failures.push(`${file} is deleted; the upgrade guide must stay until GA`);
}
for (const {name} of bumps.filter((bump) => bump.level === 'major')) {
  const guide = GUIDE_BY_PACKAGE[name];
  if (!guide) {
    failures.push(`${name} bumps major but has no v3 to v4 upgrade guide; add one and list it in GUIDE_BY_PACKAGE`);
  } else if (!guideTouched.includes(guide)) {
    failures.push(`${name} bumps major without an entry in ${guide}`);
  }
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

for (const file of publishedSourceFiles) {
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

function publishedPackageOf(file) {
  const parts = file.split('/');
  if (parts[0] !== 'packages') return undefined;
  for (let depth = parts.length - 1; depth >= 2; depth--) {
    const dir = parts.slice(0, depth).join('/');
    const manifest = join(root, dir, 'package.json');
    if (!existsSync(manifest)) continue;
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    const relative = parts.slice(depth).join('/');
    if (pkg.private || !PUBLISHED_SOURCE_ROOTS.some((prefix) => relative.startsWith(prefix))) return undefined;
    return pkg.name;
  }
  return undefined;
}

function isTestOrDoc(file) {
  return /\.(test|spec|test-d|e2e)\.[cm]?[jt]sx?$|\.stories\.|__tests__\/|\/e2e\/|\/test\/|\.md$/.test(file);
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
