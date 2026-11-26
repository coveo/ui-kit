#!/usr/bin/env node
/**
 * Refuses the changesets that the target branch cannot ship.
 *
 * main collects the v4 breaking changes from the v3 cut to the v4 GA (KIT-6480). While its
 * UI_KIT_MAJOR_WINDOW is "open", a package that gets a major from a changeset or its fixed group
 * must change its upgrade guide in the same range. While the window is closed, a major on a UI-Kit
 * package would make the next release publish a new major, so the guard refuses it. Until the v4
 * GA, the packages that main does not publish sit in its Changesets `ignore` list, and a changeset
 * that names both a package Changesets skips and one it publishes makes `changeset version` throw,
 * so the guard refuses that too.
 *
 * v3 publishes the 3.x releases (KIT-6763). It refuses a major on any package, and any release of
 * the packages that publish from main only, so that the two lines never publish the same version.
 *
 * The guard plans the release from every changeset at the base and at the head, the way
 * Changesets 3 does (highest bump, fixed groups, and only a patch for the packages built on a
 * bumped one), and reports what the range introduces.
 *
 * On both lines, `.changeset/config.json` must name the target branch as `baseBranch`, since a
 * merge of v3 into main brings v3's value without a conflict. A range that removes pending
 * changesets of a package the target branch publishes, without releasing that package, gets a
 * warning: the next release and its changelog would leave them out.
 *
 * main and v3 carry this same file, so that merging v3 into main before the v4 GA does not
 * conflict here.
 *
 * Usage: node changeset-major-guard.mjs --base <sha>
 * Environment: BASE_REF (target branch, default main), UI_KIT_MAJOR_WINDOW (main only: open or closed, default closed)
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

export const MAIN_ONLY_PACKAGES = ['@coveo/thermidor'];

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

function describe({kind, source}, type = 'major') {
  return kind === 'changeset' ? `${type} in ${source}` : `fixed group with ${source}`;
}

function listWithCauses(plan, names) {
  return names
    .map((name) => `${name} (${describe(plan.causes.get(name), plan.bumps.get(name))})`)
    .join(', ');
}

function versionOf(packages, name) {
  return packages.find((pkg) => pkg.name === name)?.version;
}

function majorOf(packages, name) {
  const version = versionOf(packages, name) ?? '';
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

export function checkV3({base, head}) {
  const before = planReleases(base);
  const after = planReleases(head);
  const shipsFromV3 = (name) => !MAIN_ONLY_PACKAGES.includes(name);
  const majors = [...after.bumps.keys()].filter(
    (name) => shipsFromV3(name) && after.bumps.get(name) === 'major'
  );
  const newMajors = majors.filter((name) => before.bumps.get(name) !== 'major');
  const mainOnly = MAIN_ONLY_PACKAGES.filter((name) => after.bumps.has(name));
  const newMainOnly = mainOnly.filter((name) => !before.bumps.has(name));
  const raisedByHand = head.packages
    .map(({name}) => name)
    .filter(
      (name) =>
        shipsFromV3(name) &&
        versionOf(base.packages, name) !== undefined &&
        majorOf(head.packages, name) > majorOf(base.packages, name)
    );
  const errors = [];
  const warnings = [];

  if (newMajors.length > 0) {
    errors.push(
      `Major version on v3: ${listWithCauses(after, newMajors)}. v3 publishes 3.x only: use a minor or patch bump, or open the breaking change against main.`
    );
  }
  if (raisedByHand.length > 0) {
    errors.push(
      `The major version in package.json changed for ${raisedByHand.join(', ')}. v3 publishes 3.x only.`
    );
  }
  if (newMainOnly.length > 0) {
    errors.push(
      `Release on v3 of packages that publish from main only: ${listWithCauses(after, newMainOnly)}. Open this change against main, so that the two lines never publish the same version.`
    );
  }
  const pendingMajors = majors.filter((name) => !newMajors.includes(name));
  if (pendingMajors.length > 0) {
    warnings.push(
      `v3 already plans a major version for ${pendingMajors.join(', ')}. Remove those changesets: the version pull request fails on them.`
    );
  }
  const pendingMainOnly = mainOnly.filter((name) => !newMainOnly.includes(name));
  if (pendingMainOnly.length > 0) {
    warnings.push(
      `v3 already plans a release of packages that publish from main only: ${pendingMainOnly.join(', ')}. Remove those changesets before the next release from v3.`
    );
  }
  return {majors, mainOnly, errors, warnings};
}

export function checkBaseBranch({head, target}) {
  if (head.baseBranch === target) {
    return {errors: []};
  }
  const setting =
    head.baseBranch === undefined
      ? 'sets no "baseBranch"'
      : `sets "baseBranch" to "${head.baseBranch}"`;
  return {
    errors: [
      `.changeset/config.json ${setting}, but this pull request targets ${target}. Each line keeps its own value: when merging v3 into main, keep main's .changeset/config.json.`,
    ],
  };
}

export function droppedChangesets({base, head, publishes}) {
  const kept = new Set(head.changesets.map(({file}) => file));
  const dropped = new Map();
  for (const {file, releases} of base.changesets.filter(({file}) => !kept.has(file))) {
    for (const {name, type} of releases) {
      const released = versionOf(head.packages, name) !== versionOf(base.packages, name);
      if (type !== 'none' && publishes(name) && !released) {
        dropped.set(name, [...(dropped.get(name) ?? []), file]);
      }
    }
  }
  return {
    packages: [...dropped.keys()],
    warnings: [...dropped].map(
      ([name, files]) =>
        `This range removes pending changesets of ${name} without releasing it (${files.join(', ')}), so its next release and changelog would leave them out. Restore them unless that is intended.`
    ),
  };
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
    baseBranch,
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
    baseBranch,
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
  if (baseRef !== 'main' && baseRef !== 'v3') {
    console.log(`The target branch is ${baseRef}, neither main nor v3: nothing to check.`);
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
    const base = readReleaseState(root, values.base);
    const head = readReleaseState(root, 'HEAD');
    if (baseRef === 'v3') {
      result = checkV3({base, head});
    } else {
      const majors = checkMajors({
        base,
        head,
        changedFiles: lines(git(root, 'diff', '--name-only', '--no-renames', values.base, 'HEAD')),
        windowOpen,
      });
      const mixed = checkMixedChangesets({base, head});
      result = {
        ...majors,
        mixed: mixed.files,
        errors: [...majors.errors, ...mixed.errors],
        warnings: [...majors.warnings, ...mixed.warnings],
      };
    }
    const skipped = skippedPackages(head);
    const dropped = droppedChangesets({
      base,
      head,
      publishes: (name) =>
        !skipped.has(name) && (baseRef === 'main' || !MAIN_ONLY_PACKAGES.includes(name)),
    });
    result.errors.push(...checkBaseBranch({head, target: baseRef}).errors);
    result.warnings.push(...dropped.warnings);
  } catch (error) {
    annotate('error', error.message);
    process.exitCode = 1;
    return;
  }

  const {errors, warnings} = result;
  if (baseRef === 'v3') {
    console.log('Target branch: v3, which publishes 3.x only');
    console.log(`Majors planned at the head: ${result.majors.join(', ') || 'none'}`);
    console.log(
      `Packages that publish from main, planned at the head: ${result.mainOnly.join(', ') || 'none'}`
    );
  } else {
    console.log(`UI-Kit major window: ${windowOpen ? 'open' : 'closed'}`);
    console.log(`UI-Kit majors planned at the head: ${result.planned.join(', ') || 'none'}`);
    console.log(`UI-Kit majors this range introduces: ${result.introduced.join(', ') || 'none'}`);
    console.log(
      `Changesets that mix held and published packages: ${result.mixed.join(', ') || 'none'}`
    );
  }
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
