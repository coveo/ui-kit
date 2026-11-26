#!/usr/bin/env node
/**
 * Refuses the changesets that main cannot ship.
 *
 * UI_KIT_MAJOR_WINDOW is "open" while main collects the v4 breaking changes, from the v3 cut to
 * the v4 GA (KIT-6480): a package that gets a major from a changeset or its fixed group must then
 * change its upgrade guide in the same range. While the window is closed, a major on a UI-Kit
 * package would make the next release publish a new major, so the guard refuses it.
 *
 * Until the v4 GA, the v4 packages sit in the Changesets `ignore` list. A changeset that names
 * both a package Changesets skips and one it publishes makes `changeset version` throw, so the
 * guard refuses it too.
 *
 * The guard plans the release from every changeset at the base and at the head, the way
 * Changesets 3 does (highest bump, fixed groups, and only a patch for the packages built on a
 * bumped one), and reports what the range introduces.
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
    releases.push({name, type});
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

// Mirrors @changesets/assemble-release-plan 7: the packages of a fixed group share its highest
// bump, and a package built on a bumped one only gets a patch, so a major never spreads to it.
export function planReleases({releases, fixedGroups}) {
  const bumps = new Map();
  const causes = new Map();
  const raise = (name, type, cause) => {
    const current = bumps.get(name);
    if (current && RANK[current] >= RANK[type]) {
      return;
    }
    bumps.set(name, type);
    causes.set(name, cause);
  };

  for (const {name, type, file} of releases) {
    if (type !== 'none') {
      raise(name, type, {kind: 'changeset', source: file});
    }
  }

  for (const group of fixedGroups) {
    const leader = group
      .filter((name) => bumps.has(name))
      .sort((a, b) => RANK[bumps.get(b)] - RANK[bumps.get(a)])[0];
    if (leader) {
      for (const name of group) {
        raise(name, bumps.get(leader), {kind: 'fixed group', source: leader});
      }
    }
  }

  return {bumps, causes};
}

// Mirrors shouldSkipPackage in @changesets/should-skip-package, with the `ignore` globs that
// @changesets/config expands to package names.
export function skippedPackages({packages, ignore = [], privatePackages}) {
  const ignored = ignore.map(globToRegExp);
  const versionsPrivate = Boolean(
    typeof privatePackages === 'object' ? privatePackages?.version : privatePackages
  );
  return new Set(
    packages
      .filter(
        ({name, version, private: isPrivate}) =>
          ignored.some((pattern) => pattern.test(name)) ||
          (isPrivate && !versionsPrivate) ||
          !version
      )
      .map(({name}) => name)
  );
}

// `changeset version` keeps a changeset that names a skipped package and deletes the others.
export function splitChangesets(state) {
  const skipped = skippedPackages(state);
  const held = [];
  const toVersion = [];
  for (const {file, releases} of state.changesets) {
    (releases.some(({name}) => skipped.has(name)) ? held : toVersion).push(file);
  }
  return {held, toVersion};
}

export function mixedChangesets(state) {
  const skipped = skippedPackages(state);
  return state.changesets
    .map(({file, releases}) => ({
      file,
      held: releases.filter(({name}) => skipped.has(name)).map(({name}) => name),
      published: releases.filter(({name}) => !skipped.has(name)).map(({name}) => name),
    }))
    .filter(({held, published}) => held.length > 0 && published.length > 0);
}

export function checkMixedChangesets({base, head}) {
  const before = new Set(mixedChangesets(base).map(({file}) => file));
  const mixed = mixedChangesets(head);
  const errors = [];
  const warnings = [];
  for (const {file, held, published} of mixed) {
    const problem = `${file} mixes packages that main holds back (${held.join(', ')}) with packages it publishes (${published.join(', ')}), and changeset version fails on such a changeset.`;
    if (before.has(file)) {
      warnings.push(`${problem} Split it before the next release.`);
    } else {
      errors.push(`${problem} Write one changeset for each group.`);
    }
  }
  return {files: mixed.map(({file}) => file), errors, warnings};
}

function describe({kind, source}) {
  return kind === 'changeset' ? `major in ${source}` : `fixed group with ${source}`;
}

function majorOf(packages, name) {
  const version = packages.find((pkg) => pkg.name === name)?.version ?? '';
  return Number(version.split('.')[0]);
}

// The UI-Kit majors that the range's own changesets bring, directly or through a fixed group,
// even when the base already holds a major for the package. A changeset counts when its file is
// new, unless the base has the same text under another name (a rename), and a release in an
// existing file counts when it was not a major at the base.
export function addedMajors({base, head}) {
  const baseByFile = new Map(base.changesets.map((changeset) => [changeset.file, changeset]));
  const baseTexts = new Set(base.changesets.map(({text}) => text));
  const added = new Map();
  for (const {file, text, releases} of head.changesets) {
    const old = baseByFile.get(file);
    if (!old && baseTexts.has(text)) {
      continue;
    }
    const wasMajor = new Set(
      (old?.releases ?? []).filter(({type}) => type === 'major').map(({name}) => name)
    );
    for (const {name, type} of releases) {
      if (type !== 'major' || wasMajor.has(name)) {
        continue;
      }
      const group = head.fixedGroups.find((members) => members.includes(name)) ?? [name];
      for (const member of group) {
        if (UI_KIT_PACKAGES.has(member) && !added.has(member)) {
          added.set(
            member,
            member === name
              ? {kind: 'changeset', source: file}
              : {kind: 'fixed group', source: name}
          );
        }
      }
    }
  }
  return added;
}

export function checkMajors({base, head, changedFiles, windowOpen}) {
  const before = planReleases(base);
  const after = planReleases(head);
  const added = addedMajors({base, head});
  const planned = [...UI_KIT_PACKAGES.keys()].filter((name) => after.bumps.get(name) === 'major');
  const introduced = planned.filter(
    (name) => before.bumps.get(name) !== 'major' || added.has(name)
  );
  const raisedByHand = [...UI_KIT_PACKAGES.keys()].filter(
    (name) => majorOf(head.packages, name) > majorOf(base.packages, name)
  );
  const errors = [];
  const warnings = [];

  if (!windowOpen) {
    if (introduced.length > 0) {
      const list = introduced
        .map((name) => `${name} (${describe(added.get(name) ?? after.causes.get(name))})`)
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
    if (!changedFiles.includes(guide)) {
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
    .map(({name, version, private: isPrivate}) => ({name, version, private: isPrivate === true}));
}

export function readReleaseState(root, ref) {
  const changesets = lines(git(root, 'ls-tree', '--name-only', ref, '.changeset/'))
    .filter((file) => file.endsWith('.md') && !file.endsWith('/README.md'))
    .map((file) => {
      const text = show(root, ref, file);
      return {file, text, releases: parseChangeset(text, file)};
    });
  const {
    fixed = [],
    ignore = [],
    privatePackages,
  } = JSON.parse(show(root, ref, '.changeset/config.json'));
  return {
    changesets,
    releases: changesets.flatMap(({file, releases}) =>
      releases.map((release) => ({...release, file}))
    ),
    packages: readWorkspacePackages(root, ref),
    fixedGroups: fixed,
    ignore,
    privatePackages,
  };
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
  let majors;
  let mixed;
  try {
    const root = git(process.cwd(), 'rev-parse', '--show-toplevel');
    const base = readReleaseState(root, values.base);
    const head = readReleaseState(root, 'HEAD');
    majors = checkMajors({
      base,
      head,
      changedFiles: lines(git(root, 'diff', '--name-only', '--no-renames', values.base, 'HEAD')),
      windowOpen,
    });
    mixed = checkMixedChangesets({base, head});
  } catch (error) {
    annotate('error', error.message);
    process.exitCode = 1;
    return;
  }

  const errors = [...majors.errors, ...mixed.errors];
  const warnings = [...majors.warnings, ...mixed.warnings];
  console.log(`UI-Kit major window: ${windowOpen ? 'open' : 'closed'}`);
  console.log(`UI-Kit majors planned at the head: ${majors.planned.join(', ') || 'none'}`);
  console.log(`UI-Kit majors this range introduces: ${majors.introduced.join(', ') || 'none'}`);
  console.log(
    `Changesets that mix held and published packages: ${mixed.files.join(', ') || 'none'}`
  );
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
