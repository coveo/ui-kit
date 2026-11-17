#!/usr/bin/env node
/**
 * Refuses a major version on a UI-Kit package unless main is open for v4 breaking changes.
 *
 * main ships UI-Kit v3 until it is frozen for v4 (KIT-4387), so a major bump would make its
 * next release publish a new major. UI_KIT_MAJOR_WINDOW is "open" from that freeze to the v4
 * GA: majors are then allowed, and a package that gets a major from a changeset or its fixed
 * group must change its upgrade guide in the same range.
 *
 * The guard plans the release from every changeset at the base and at the head, the way
 * Changesets does (highest bump, fixed groups, majors on peer dependents), and reports the
 * UI-Kit majors that the range introduces.
 *
 * Usage: node changeset-major-guard.mjs --base <sha>
 * Environment: BASE_REF (target branch, default main), UI_KIT_MAJOR_WINDOW (open or closed, default closed)
 */

import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';

export const UI_KIT_PACKAGES = new Map([
  ['@coveo/headless', {guide: 'packages/headless/source_docs/upgrade-from-v3-to-v4.md'}],
  [
    '@coveo/headless-react',
    {guide: 'packages/headless-react/source_docs/upgrade-from-v3-to-v4.md'},
  ],
  ['@coveo/atomic', {guide: 'packages/atomic/upgrade-from-v3-to-v4.md'}],
  ['@coveo/atomic-react', {guide: 'packages/atomic/upgrade-from-v3-to-v4.md'}],
  ['@coveo/atomic-angular', {guide: 'packages/atomic/upgrade-from-v3-to-v4.md'}],
]);

const RANK = {patch: 1, minor: 2, major: 3};
const RELEASE_LINE = /^(['"]?)([^'"\s:]+)\1\s*:\s*(['"]?)(major|minor|patch|none)\3\s*(?:#.*)?$/;

export function parseChangeset(text, file) {
  const frontmatter = /^\uFEFF?\s*---([\s\S]*?)\r?\n\s*---(?:\s*(?:\r?\n|$))/.exec(text);
  if (!frontmatter) {
    throw new Error(`${file} has no front matter, so Changesets cannot read it.`);
  }
  const releases = [];
  for (const line of frontmatter[1].split(/\r?\n/).map((text) => text.trim())) {
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const match = RELEASE_LINE.exec(line);
    if (!match) {
      throw new Error(
        `${file} has a front matter line the guard cannot read: ${line}. Write one "package": bump pair per line.`
      );
    }
    const [, , name, , type] = match;
    if (type !== 'none') {
      releases.push({name, type});
    }
  }
  return releases;
}

export function workspacePatterns(yaml) {
  const patterns = [];
  let inPackages = false;
  for (const line of yaml.split(/\r?\n/)) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (!inPackages || /^\s*(#.*)?$/.test(line)) {
      continue;
    }
    const item = /^\s+-\s+(['"]?)(.+?)\1\s*$/.exec(line);
    if (!item) {
      break;
    }
    patterns.push(item[2].replace(/^\.\//, '').replace(/\/$/, ''));
  }
  return patterns;
}

export function globToRegExp(glob) {
  const escape = (text) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const source = glob
    .split('**')
    .map((part) => part.split('*').map(escape).join('[^/]*'))
    .join('.*');
  return new RegExp(`^${source}$`);
}

// Mirrors shouldBumpMajor in @changesets/assemble-release-plan, which reads workspace:* as the
// exact current version and workspace:^ or workspace:~ as a caret or tilde range on it.
export function peerForcesMajor(range, type, version = '') {
  if (type === 'patch') {
    return false;
  }
  const isWorkspace = range.startsWith('workspace:');
  const spec = range.replace(/^workspace:/, '');
  if (spec === '*') {
    return isWorkspace;
  }
  if (spec.startsWith('~')) {
    return true;
  }
  if (spec.startsWith('^')) {
    const base = spec.slice(1) || version;
    return type === 'major' || (base !== '' && Number(base.split('.')[0]) === 0);
  }
  return /^\d/.test(spec) || type === 'major';
}

export function planReleases({releases, packages, fixedGroups}) {
  const bumps = new Map();
  const causes = new Map();
  const raise = (name, type, cause) => {
    const current = bumps.get(name);
    if (current && RANK[current] >= RANK[type]) {
      return false;
    }
    bumps.set(name, type);
    causes.set(name, cause);
    return true;
  };

  for (const {name, type, file} of releases) {
    raise(name, type, {kind: 'changeset', source: file});
  }

  const versions = new Map(packages.map(({name, version}) => [name, version]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const group of fixedGroups) {
      const leader = group
        .filter((name) => bumps.has(name))
        .sort((a, b) => RANK[bumps.get(b)] - RANK[bumps.get(a)])[0];
      if (!leader) {
        continue;
      }
      for (const name of group) {
        if (raise(name, bumps.get(leader), {kind: 'fixed group', source: leader})) {
          changed = true;
        }
      }
    }
    for (const {name, peerDependencies = {}} of packages) {
      for (const [dependency, range] of Object.entries(peerDependencies)) {
        const type = bumps.get(dependency);
        if (
          type &&
          peerForcesMajor(range, type, versions.get(dependency)) &&
          raise(name, 'major', {kind: 'peer dependency', source: dependency})
        ) {
          changed = true;
        }
      }
    }
  }

  return {bumps, causes};
}

function describe({kind, source}) {
  if (kind === 'changeset') {
    return `major in ${source}`;
  }
  return kind === 'fixed group' ? `fixed group with ${source}` : `peer dependency on ${source}`;
}

function majorOf(packages, name) {
  const version = packages.find((pkg) => pkg.name === name)?.version ?? '';
  return Number(version.split('.')[0]);
}

export function checkMajors({base, head, changedFiles, windowOpen}) {
  const before = planReleases(base);
  const after = planReleases(head);
  const planned = [...UI_KIT_PACKAGES.keys()].filter((name) => after.bumps.get(name) === 'major');
  const introduced = planned.filter((name) => before.bumps.get(name) !== 'major');
  const raisedByHand = [...UI_KIT_PACKAGES.keys()].filter(
    (name) => majorOf(head.packages, name) > majorOf(base.packages, name)
  );
  const errors = [];
  const warnings = [];

  if (!windowOpen) {
    if (introduced.length > 0) {
      const list = introduced
        .map((name) => `${name} (${describe(after.causes.get(name))})`)
        .join(', ');
      errors.push(
        `UI-Kit major version on main: ${list}. main still ships UI-Kit v3, so its next release would publish a new major. Use a minor or patch bump, or keep the breaking change on a branch until main is frozen for v4.`
      );
    }
    if (raisedByHand.length > 0) {
      errors.push(
        `The major version in package.json changed for ${raisedByHand.join(', ')}. main still ships UI-Kit v3; let Changesets set versions once main is frozen for v4.`
      );
    }
    const pending = planned.filter((name) => !introduced.includes(name));
    if (pending.length > 0) {
      warnings.push(
        `main already plans a major version for ${pending.join(', ')}. Its next release will publish it.`
      );
    }
    return {planned, introduced, errors, warnings};
  }

  for (const name of introduced) {
    const {guide} = UI_KIT_PACKAGES.get(name);
    if (after.causes.get(name).kind !== 'peer dependency' && !changedFiles.includes(guide)) {
      errors.push(
        `${name} gets a major version, but ${guide} is unchanged. Add the upgrade guide entry in the same pull request.`
      );
    }
  }
  return {planned, introduced, errors, warnings};
}

export function readWorkspacePackages(root, ref) {
  const patterns = workspacePatterns(show(root, ref, 'pnpm-workspace.yaml'));
  const include = patterns.filter((pattern) => !pattern.startsWith('!')).map(globToRegExp);
  const exclude = patterns
    .filter((pattern) => pattern.startsWith('!'))
    .map((pattern) => globToRegExp(pattern.slice(1)));
  return lines(git(root, 'ls-tree', '-r', '--name-only', ref))
    .filter((file) => file.endsWith('/package.json'))
    .map((file) => file.slice(0, -'/package.json'.length))
    .filter(
      (dir) =>
        include.some((pattern) => pattern.test(dir)) &&
        !exclude.some((pattern) => pattern.test(dir))
    )
    .map((dir) => JSON.parse(show(root, ref, `${dir}/package.json`)))
    .filter((manifest) => manifest.name)
    .map(({name, version, peerDependencies}) => ({name, version, peerDependencies}));
}

export function readReleaseState(root, ref) {
  const releases = lines(git(root, 'ls-tree', '--name-only', ref, '.changeset/'))
    .filter((file) => file.endsWith('.md') && !file.endsWith('/README.md'))
    .flatMap((file) =>
      parseChangeset(show(root, ref, file), file).map((release) => ({...release, file}))
    );
  const {fixed = []} = JSON.parse(show(root, ref, '.changeset/config.json'));
  return {releases, packages: readWorkspacePackages(root, ref), fixedGroups: fixed};
}

function main() {
  const {values} = parseArgs({options: {base: {type: 'string'}}});
  if (!values.base) {
    console.error('Usage: node changeset-major-guard.mjs --base <sha>');
    process.exitCode = 2;
    return;
  }

  const baseRef = (process.env.BASE_REF || 'main').replace(/^refs\/heads\//, '');
  if (baseRef !== 'main') {
    console.log(`The target branch is ${baseRef}, not main: nothing to check.`);
    return;
  }

  const annotate = (level, message) =>
    console.log(
      process.env.GITHUB_ACTIONS === 'true' ? `::${level}::${message}` : `${level}: ${message}`
    );
  const windowOpen = process.env.UI_KIT_MAJOR_WINDOW === 'open';
  let result;
  try {
    const root = git(process.cwd(), 'rev-parse', '--show-toplevel');
    result = checkMajors({
      base: readReleaseState(root, values.base),
      head: readReleaseState(root, 'HEAD'),
      changedFiles: lines(git(root, 'diff', '--name-only', '--no-renames', values.base, 'HEAD')),
      windowOpen,
    });
  } catch (error) {
    annotate('error', error.message);
    process.exitCode = 1;
    return;
  }

  const {planned, introduced, errors, warnings} = result;
  console.log(`UI-Kit major window: ${windowOpen ? 'open' : 'closed'}`);
  console.log(`UI-Kit majors planned at the head: ${planned.join(', ') || 'none'}`);
  console.log(`UI-Kit majors this range introduces: ${introduced.join(', ') || 'none'}`);
  for (const warning of warnings) {
    annotate('warning', warning);
  }
  for (const error of errors) {
    annotate('error', error);
  }
  process.exitCode = errors.length ? 1 : 0;
}

function git(cwd, ...args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}

function show(root, ref, path) {
  return git(root, 'show', `${ref}:${path}`);
}

function lines(text) {
  return text.split('\n').filter(Boolean);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
