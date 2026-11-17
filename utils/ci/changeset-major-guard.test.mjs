import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';
import {
  checkMajors,
  globToRegExp,
  parseChangeset,
  peerForcesMajor,
  planReleases,
  workspacePatterns,
} from './changeset-major-guard.mjs';

const PACKAGES = [
  {name: '@coveo/bueno', version: '1.1.9'},
  {name: '@coveo/relay', version: '2.1.3'},
  {name: '@coveo/headless', version: '3.58.1'},
  {
    name: '@coveo/atomic',
    version: '3.65.0',
    peerDependencies: {
      '@coveo/bueno': 'workspace:^',
      '@coveo/headless': 'workspace:^',
    },
  },
  {
    name: '@coveo/atomic-react',
    version: '3.11.50',
    peerDependencies: {'@coveo/headless': 'workspace:^'},
  },
  {
    name: '@coveo/atomic-angular',
    version: '3.11.33',
    peerDependencies: {'@coveo/headless': 'workspace:^'},
  },
  {name: '@coveo/thermidor', version: '0.8.0'},
];
const FIXED = [['@coveo/atomic', '@coveo/ui-kit-sample-atomic-search-vite']];
const HEADLESS_GUIDE = 'packages/headless/source_docs/upgrade-from-v3-to-v4.md';
const ATOMIC_GUIDE = 'packages/atomic/upgrade-from-v3-to-v4.md';

function state(releases = [], {packages = PACKAGES, fixedGroups = FIXED} = {}) {
  return {
    releases: releases.map((release) => ({file: '.changeset/a.md', ...release})),
    packages,
    fixedGroups,
  };
}

function check({base = state(), head, changedFiles = [], windowOpen = false}) {
  return checkMajors({base, head, changedFiles, windowOpen});
}

describe('parseChangeset', () => {
  it('reads each package and its bump from the front matter', () => {
    const text =
      '---\n\'@coveo/headless\': major\n"@coveo/atomic": minor\n@coveo/bueno: patch\n---\n\nText.';
    assert.deepEqual(parseChangeset(text, 'a.md'), [
      {name: '@coveo/headless', type: 'major'},
      {name: '@coveo/atomic', type: 'minor'},
      {name: '@coveo/bueno', type: 'patch'},
    ]);
  });

  it('reads quoted bumps, comments, a byte order mark and leading blank lines', () => {
    const text =
      "\uFEFF\n---\n'@coveo/headless': 'major' # breaking\n# a comment\n'@coveo/bueno': none\n---\n";
    assert.deepEqual(parseChangeset(text, 'a.md'), [{name: '@coveo/headless', type: 'major'}]);
  });

  it('returns nothing for an empty changeset', () => {
    assert.deepEqual(parseChangeset('---\n---\n\nNothing to release.', 'a.md'), []);
  });

  it('refuses a front matter line it cannot read', () => {
    assert.throws(
      () => parseChangeset("---\n{'@coveo/headless': major}\n---\n", '.changeset/a.md'),
      /\.changeset\/a\.md has a front matter line the guard cannot read/
    );
  });
});

describe('peerForcesMajor', () => {
  it('never forces a major for a patch', () => {
    assert.equal(peerForcesMajor('workspace:*', 'patch', '3.58.1'), false);
  });

  it('forces a major on a caret range only for a major', () => {
    assert.equal(peerForcesMajor('workspace:^', 'minor', '3.58.1'), false);
    assert.equal(peerForcesMajor('workspace:^', 'major', '3.58.1'), true);
  });

  it('forces a major on a caret range below 1.0.0 for a minor', () => {
    assert.equal(peerForcesMajor('workspace:^', 'minor', '0.8.0'), true);
  });

  it('forces a major on a tilde range or an exact version for a minor', () => {
    assert.equal(peerForcesMajor('workspace:~', 'minor', '3.58.1'), true);
    assert.equal(peerForcesMajor('workspace:*', 'minor', '3.58.1'), true);
  });

  it('never forces a major on a star range', () => {
    assert.equal(peerForcesMajor('*', 'major', '3.58.1'), false);
  });
});

describe('planReleases', () => {
  it('gives a major to the peer dependents of a major', () => {
    const {bumps, causes} = planReleases(state([{name: '@coveo/headless', type: 'major'}]));
    assert.equal(bumps.get('@coveo/atomic'), 'major');
    assert.equal(bumps.get('@coveo/atomic-react'), 'major');
    assert.equal(bumps.get('@coveo/atomic-angular'), 'major');
    assert.deepEqual(causes.get('@coveo/atomic'), {
      kind: 'peer dependency',
      source: '@coveo/headless',
    });
  });

  it('shares the highest bump across a fixed group', () => {
    const {bumps} = planReleases(
      state([{name: '@coveo/ui-kit-sample-atomic-search-vite', type: 'major'}])
    );
    assert.equal(bumps.get('@coveo/atomic'), 'major');
  });

  it('leaves peer dependents alone on a minor', () => {
    const {bumps} = planReleases(state([{name: '@coveo/headless', type: 'minor'}]));
    assert.equal(bumps.has('@coveo/atomic'), false);
  });
});

describe('checkMajors while the window is closed', () => {
  it('refuses a UI-Kit major', () => {
    const {errors} = check({head: state([{name: '@coveo/headless', type: 'major'}])});
    assert.equal(errors.length, 1);
    assert.match(
      errors[0],
      /UI-Kit major version on main: @coveo\/headless \(major in \.changeset\/a\.md\), @coveo\/atomic \(peer dependency on @coveo\/headless\)/
    );
  });

  it('allows a major outside UI-Kit', () => {
    const {errors} = check({head: state([{name: '@coveo/thermidor', type: 'major'}])});
    assert.deepEqual(errors, []);
  });

  it('refuses a major that reaches UI-Kit through a peer dependency', () => {
    const {errors} = check({head: state([{name: '@coveo/bueno', type: 'major'}])});
    assert.match(errors[0], /@coveo\/atomic \(peer dependency on @coveo\/bueno\)/);
  });

  it('refuses a major that reaches UI-Kit through a fixed group', () => {
    const {errors} = check({
      head: state([{name: '@coveo/ui-kit-sample-atomic-search-vite', type: 'major'}]),
    });
    assert.match(
      errors[0],
      /@coveo\/atomic \(fixed group with @coveo\/ui-kit-sample-atomic-search-vite\)/
    );
  });

  it('refuses a new peer dependency on a package main already bumps to major', () => {
    const pending = [{name: '@coveo/relay', type: 'major', file: '.changeset/relay.md'}];
    const withPeer = PACKAGES.map((pkg) =>
      pkg.name === '@coveo/atomic'
        ? {...pkg, peerDependencies: {...pkg.peerDependencies, '@coveo/relay': 'workspace:^'}}
        : pkg
    );
    const {errors} = check({
      base: state(pending),
      head: state(pending, {packages: withPeer}),
    });
    assert.match(errors[0], /@coveo\/atomic \(peer dependency on @coveo\/relay\)/);
  });

  it('refuses a major version written into package.json by hand', () => {
    const raised = PACKAGES.map((pkg) =>
      pkg.name === '@coveo/headless' ? {...pkg, version: '4.0.0'} : pkg
    );
    const {errors} = check({head: state([], {packages: raised})});
    assert.deepEqual(errors, [
      'The major version in package.json changed for @coveo/headless. main still ships UI-Kit v3; let Changesets set versions once main is frozen for v4.',
    ]);
  });

  it('warns about a major that main already plans instead of failing', () => {
    const pending = state([{name: '@coveo/headless', type: 'major'}]);
    const {errors, warnings} = check({base: pending, head: pending});
    assert.deepEqual(errors, []);
    assert.match(warnings[0], /main already plans a major version for @coveo\/headless/);
  });
});

describe('checkMajors while the window is open', () => {
  it('allows a UI-Kit major with its guide entry', () => {
    const {errors} = check({
      head: state([{name: '@coveo/headless', type: 'major'}]),
      changedFiles: [HEADLESS_GUIDE],
      windowOpen: true,
    });
    assert.deepEqual(errors, []);
  });

  it('asks for the guide entry of a package bumped to major', () => {
    const {errors} = check({
      head: state([{name: '@coveo/headless', type: 'major'}]),
      windowOpen: true,
    });
    assert.deepEqual(errors, [
      `@coveo/headless gets a major version, but ${HEADLESS_GUIDE} is unchanged. Add the upgrade guide entry in the same pull request.`,
    ]);
  });

  it('asks for the guide entry of a package that gets a major from its fixed group', () => {
    const {errors} = check({
      head: state([{name: '@coveo/ui-kit-sample-atomic-search-vite', type: 'major'}]),
      windowOpen: true,
    });
    assert.deepEqual(errors, [
      `@coveo/atomic gets a major version, but ${ATOMIC_GUIDE} is unchanged. Add the upgrade guide entry in the same pull request.`,
    ]);
  });

  it('does not ask again when a planned major changeset is renamed', () => {
    const {errors} = check({
      base: state([{name: '@coveo/headless', type: 'major', file: '.changeset/old.md'}]),
      head: state([{name: '@coveo/headless', type: 'major', file: '.changeset/new.md'}]),
      windowOpen: true,
    });
    assert.deepEqual(errors, []);
  });

  it('allows a major version written into package.json', () => {
    const raised = PACKAGES.map((pkg) =>
      pkg.name === '@coveo/headless' ? {...pkg, version: '4.0.0'} : pkg
    );
    const {errors} = check({head: state([], {packages: raised}), windowOpen: true});
    assert.deepEqual(errors, []);
  });
});

describe('workspacePatterns', () => {
  it('reads the package globs and stops at the next key', () => {
    const yaml =
      "packages:\n  - packages/bueno\n  # a comment\n  - 'samples/atomic/*'\n  - ./utils/ci/\n\ncatalog:\n  msw: 2.15.0\n";
    assert.deepEqual(workspacePatterns(yaml), ['packages/bueno', 'samples/atomic/*', 'utils/ci']);
  });
});

describe('globToRegExp', () => {
  it('matches one path segment per star', () => {
    assert.equal(globToRegExp('samples/atomic/*').test('samples/atomic/vite'), true);
    assert.equal(globToRegExp('samples/atomic/*').test('samples/atomic/vite/nested'), false);
  });
});

describe('the command line', () => {
  const script = join(dirname(fileURLToPath(import.meta.url)), 'changeset-major-guard.mjs');
  let home;
  let repo;
  let base;
  let env;

  function git(...args) {
    return execFileSync('git', args, {cwd: repo, env, encoding: 'utf8'}).trim();
  }

  function write(path, content) {
    mkdirSync(dirname(join(repo, path)), {recursive: true});
    writeFileSync(join(repo, path), content);
  }

  function commit(message) {
    git('add', '--all');
    git('commit', '--quiet', '--no-gpg-sign', '--message', message);
  }

  function run(extraEnv) {
    return spawnSync(process.execPath, [script, '--base', base], {
      cwd: repo,
      env: {...env, GITHUB_ACTIONS: '', ...extraEnv},
      encoding: 'utf8',
    });
  }

  beforeEach(() => {
    home = mkdtempSync(join(tmpdir(), 'major-guard-home-'));
    repo = mkdtempSync(join(tmpdir(), 'major-guard-repo-'));
    env = {
      ...process.env,
      HOME: home,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    };
    git('init', '--quiet', '--initial-branch=main');
    write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');
    write(
      'packages/headless/package.json',
      JSON.stringify({name: '@coveo/headless', version: '3.0.0'})
    );
    write(
      'packages/atomic/package.json',
      JSON.stringify({
        name: '@coveo/atomic',
        version: '3.0.0',
        peerDependencies: {'@coveo/headless': 'workspace:^'},
      })
    );
    write('.changeset/config.json', JSON.stringify({fixed: []}));
    write('.changeset/README.md', 'Changesets.');
    commit('base');
    base = git('rev-parse', 'HEAD');
    write('.changeset/break.md', "---\n'@coveo/headless': major\n---\n\nBreak.");
    commit('break headless');
  });

  afterEach(() => {
    rmSync(repo, {recursive: true, force: true});
    rmSync(home, {recursive: true, force: true});
  });

  it('fails on a major that reaches main while the window is closed', () => {
    const result = run({BASE_REF: 'main'});
    assert.equal(result.status, 1);
    assert.match(result.stdout, /@coveo\/atomic \(peer dependency on @coveo\/headless\)/);
  });

  it('skips a pull request that does not target main', () => {
    const result = run({BASE_REF: 'refs/heads/feature'});
    assert.equal(result.status, 0);
    assert.match(result.stdout, /nothing to check/);
  });

  it('passes once the guide entry is in the range while the window is open', () => {
    assert.equal(run({UI_KIT_MAJOR_WINDOW: 'open'}).status, 1);
    write(HEADLESS_GUIDE, '# Upgrade from v3 to v4\n');
    commit('add the guide entry');
    assert.equal(run({UI_KIT_MAJOR_WINDOW: 'open'}).status, 0);
  });

  it('reports a changeset it cannot read as an error', () => {
    write('.changeset/flow.md', "---\n{'@coveo/headless': minor}\n---\n");
    commit('add an unreadable changeset');
    const result = run({});
    assert.equal(result.status, 1);
    assert.match(result.stdout, /error: \.changeset\/flow\.md has a front matter line/);
  });
});
