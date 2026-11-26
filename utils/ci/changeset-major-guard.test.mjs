import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';
import {
  checkMajors,
  checkMixedChangesets,
  checkV3,
  globToRegExp,
  parseChangeset,
  planReleases,
  skippedPackages,
  splitChangesets,
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
  {name: '@coveo/quantic', version: '3.40.0'},
];
const FIXED = [['@coveo/atomic', '@coveo/ui-kit-sample-atomic-search-vite']];
const PAUSED = ['@coveo/headless', '@coveo/atomic', '@coveo/atomic-react', '@coveo/atomic-angular'];
const HEADLESS_GUIDE = 'packages/headless/source_docs/upgrade-from-v3-to-v4.md';
const ATOMIC_GUIDE = 'packages/atomic/upgrade-from-v3-to-v4.md';

function state(
  releases = [],
  {packages = PACKAGES, fixedGroups = FIXED, ignore = [], privatePackages, texts = {}} = {}
) {
  const withFiles = releases.map((release) => ({file: '.changeset/a.md', ...release}));
  const files = [...new Set(withFiles.map(({file}) => file))];
  return {
    changesets: files.map((file) => {
      const fileReleases = withFiles
        .filter((release) => release.file === file)
        .map(({name, type}) => ({name, type}));
      return {file, text: texts[file] ?? JSON.stringify(fileReleases), releases: fileReleases};
    }),
    releases: withFiles,
    packages,
    fixedGroups,
    ignore,
    privatePackages,
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

  it('reads quoted bumps, none, comments, a byte order mark and leading blank lines', () => {
    const text =
      "\uFEFF\n---\n'@coveo/headless': 'major' # breaking\n# a comment\n'@coveo/bueno': none\n---\n";
    assert.deepEqual(parseChangeset(text, 'a.md'), [
      {name: '@coveo/headless', type: 'major'},
      {name: '@coveo/bueno', type: 'none'},
    ]);
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

describe('planReleases', () => {
  it('leaves the packages built on a major to the patch that Changesets gives them', () => {
    const {bumps} = planReleases(state([{name: '@coveo/headless', type: 'major'}]));
    assert.deepEqual([...bumps], [['@coveo/headless', 'major']]);
  });

  it('shares the highest bump across a fixed group', () => {
    const {bumps} = planReleases(
      state([{name: '@coveo/ui-kit-sample-atomic-search-vite', type: 'major'}])
    );
    assert.equal(bumps.get('@coveo/atomic'), 'major');
  });

  it('skips a release of type none', () => {
    const {bumps} = planReleases(state([{name: '@coveo/headless', type: 'none'}]));
    assert.equal(bumps.size, 0);
  });
});

describe('skippedPackages', () => {
  it('skips the ignored packages, globs included, the private ones and those without a version', () => {
    const packages = [
      {name: '@coveo/headless', version: '3.58.1'},
      {name: '@coveo/ui-kit-sample-headless-search-vite', version: '3.58.1'},
      {name: '@coveo/atomic-playground', version: '0.0.0', private: true},
      {name: '@samples/without-version'},
      {name: '@coveo/thermidor', version: '0.8.0'},
    ];
    const skipped = skippedPackages({
      packages,
      ignore: ['@coveo/headless', '@coveo/ui-kit-sample-*'],
      privatePackages: {version: false, tag: false},
    });
    assert.deepEqual(
      [...skipped],
      [
        '@coveo/headless',
        '@coveo/ui-kit-sample-headless-search-vite',
        '@coveo/atomic-playground',
        '@samples/without-version',
      ]
    );
  });

  it('keeps the private packages when the config versions them', () => {
    const packages = [{name: '@coveo/atomic-playground', version: '0.0.0', private: true}];
    assert.equal(skippedPackages({packages, privatePackages: {version: true}}).size, 0);
    assert.equal(skippedPackages({packages, privatePackages: true}).size, 0);
    assert.equal(skippedPackages({packages}).size, 1);
  });
});

describe('splitChangesets', () => {
  it('holds the changesets that name a skipped package and versions the others', () => {
    const {held, toVersion} = splitChangesets(
      state(
        [
          {name: '@coveo/headless', type: 'major', file: '.changeset/break.md'},
          {name: '@coveo/thermidor', type: 'minor', file: '.changeset/feature.md'},
          {name: '@coveo/atomic', type: 'none', file: '.changeset/note.md'},
        ],
        {ignore: PAUSED}
      )
    );
    assert.deepEqual(held, ['.changeset/break.md', '.changeset/note.md']);
    assert.deepEqual(toVersion, ['.changeset/feature.md']);
  });

  it('versions an empty changeset', () => {
    const {toVersion} = splitChangesets({
      ...state(),
      changesets: [{file: '.changeset/empty.md', releases: []}],
    });
    assert.deepEqual(toVersion, ['.changeset/empty.md']);
  });
});

describe('checkMixedChangesets', () => {
  const mixed = [
    {name: '@coveo/headless', type: 'minor', file: '.changeset/mixed.md'},
    {name: '@coveo/thermidor', type: 'minor', file: '.changeset/mixed.md'},
  ];

  it('refuses a changeset that names a paused package and a published one', () => {
    const {files, errors} = checkMixedChangesets({
      base: state([], {ignore: PAUSED}),
      head: state(mixed, {ignore: PAUSED}),
    });
    assert.deepEqual(files, ['.changeset/mixed.md']);
    assert.deepEqual(errors, [
      '.changeset/mixed.md mixes packages that main holds back (@coveo/headless) with packages it publishes (@coveo/thermidor), and changeset version fails on such a changeset. Write one changeset for each group.',
    ]);
  });

  it('allows the same changeset while no package is paused', () => {
    const {errors} = checkMixedChangesets({base: state(), head: state(mixed)});
    assert.deepEqual(errors, []);
  });

  it('refuses a changeset that the range turns into a mixed one by pausing a package', () => {
    const {errors} = checkMixedChangesets({
      base: state(mixed),
      head: state(mixed, {ignore: PAUSED}),
    });
    assert.equal(errors.length, 1);
  });

  it('warns about a mixed changeset that main already holds instead of failing', () => {
    const pending = state(mixed, {ignore: PAUSED});
    const {errors, warnings} = checkMixedChangesets({base: pending, head: pending});
    assert.deepEqual(errors, []);
    assert.match(warnings[0], /mixes packages .* Split it before the next release\.$/);
  });
});

describe('checkMajors while the window is closed', () => {
  it('refuses a UI-Kit major', () => {
    const {errors} = check({head: state([{name: '@coveo/headless', type: 'major'}])});
    assert.equal(errors.length, 1);
    assert.match(
      errors[0],
      /^UI-Kit major version on main: @coveo\/headless \(major in \.changeset\/a\.md\)\. /
    );
  });

  it('allows a major outside UI-Kit', () => {
    const {errors} = check({head: state([{name: '@coveo/thermidor', type: 'major'}])});
    assert.deepEqual(errors, []);
  });

  it('allows a major on a package that UI-Kit is built on', () => {
    const {planned, errors} = check({head: state([{name: '@coveo/bueno', type: 'major'}])});
    assert.deepEqual(planned, []);
    assert.deepEqual(errors, []);
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

  it('refuses a major version written into package.json by hand', () => {
    const raised = PACKAGES.map((pkg) =>
      pkg.name === '@coveo/headless' ? {...pkg, version: '4.0.0'} : pkg
    );
    const {errors} = check({head: state([], {packages: raised})});
    assert.deepEqual(errors, [
      'The major version in package.json changed for @coveo/headless. main still ships UI-Kit v3; let Changesets set versions once main is frozen for v4.',
    ]);
  });

  it('refuses a second major on a package that main already plans', () => {
    const texts = {'.changeset/first.md': 'Remove A.', '.changeset/second.md': 'Remove B.'};
    const first = {name: '@coveo/headless', type: 'major', file: '.changeset/first.md'};
    const second = {name: '@coveo/headless', type: 'major', file: '.changeset/second.md'};
    const {errors} = check({
      base: state([first], {texts}),
      head: state([first, second], {texts}),
    });
    assert.match(errors[0], /@coveo\/headless \(major in \.changeset\/second\.md\)/);
  });

  it('warns about a major that main already plans instead of failing', () => {
    const pending = state([{name: '@coveo/headless', type: 'major'}]);
    const {errors, warnings} = check({base: pending, head: pending});
    assert.deepEqual(errors, []);
    assert.match(warnings[0], /main already plans a major version for @coveo\/headless/);
  });
});

describe('checkMajors while the window is open', () => {
  it('allows a UI-Kit major with its guide entry, and asks nothing of the packages built on it', () => {
    const {planned, errors} = check({
      head: state([{name: '@coveo/headless', type: 'major'}]),
      changedFiles: [HEADLESS_GUIDE],
      windowOpen: true,
    });
    assert.deepEqual(planned, ['@coveo/headless']);
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

  it('asks for the guide entry of each breaking pull request, not only the first one', () => {
    const texts = {'.changeset/first.md': 'Remove A.', '.changeset/second.md': 'Remove B.'};
    const first = {name: '@coveo/headless', type: 'major', file: '.changeset/first.md'};
    const second = {name: '@coveo/headless', type: 'major', file: '.changeset/second.md'};
    const base = state([first], {texts});
    const head = state([first, second], {texts});
    assert.deepEqual(check({base, head, windowOpen: true}).errors, [
      `@coveo/headless gets a major version, but ${HEADLESS_GUIDE} is unchanged. Add the upgrade guide entry in the same pull request.`,
    ]);
    assert.deepEqual(
      check({base, head, changedFiles: [HEADLESS_GUIDE], windowOpen: true}).errors,
      []
    );
  });

  it('does not ask again when a held major changeset is reworded', () => {
    const held = [{name: '@coveo/headless', type: 'major', file: '.changeset/first.md'}];
    const {errors} = check({
      base: state(held, {texts: {'.changeset/first.md': 'Remove A.'}}),
      head: state(held, {texts: {'.changeset/first.md': 'Remove A, the legacy way.'}}),
      windowOpen: true,
    });
    assert.deepEqual(errors, []);
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

describe('checkV3', () => {
  it('allows a minor or a patch on the packages that v3 publishes', () => {
    const {errors, warnings} = checkV3({
      base: state(),
      head: state([
        {name: '@coveo/headless', type: 'minor'},
        {name: '@coveo/quantic', type: 'patch', file: '.changeset/b.md'},
      ]),
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
  });

  it('refuses a major on any package', () => {
    const {errors} = checkV3({
      base: state(),
      head: state([{name: '@coveo/quantic', type: 'major'}]),
    });
    assert.deepEqual(errors, [
      'Major version on v3: @coveo/quantic (major in .changeset/a.md). v3 publishes 3.x only: use a minor or patch bump, or open the breaking change against main.',
    ]);
  });

  it('names only the package of the major, since the packages built on it get a patch', () => {
    const {errors} = checkV3({
      base: state(),
      head: state([{name: '@coveo/headless', type: 'major'}]),
    });
    assert.deepEqual(errors, [
      'Major version on v3: @coveo/headless (major in .changeset/a.md). v3 publishes 3.x only: use a minor or patch bump, or open the breaking change against main.',
    ]);
  });

  it('refuses a major version written into package.json by hand', () => {
    const raised = PACKAGES.map((pkg) =>
      pkg.name === '@coveo/quantic' ? {...pkg, version: '4.0.0'} : pkg
    );
    const {errors} = checkV3({base: state(), head: state([], {packages: raised})});
    assert.deepEqual(errors, [
      'The major version in package.json changed for @coveo/quantic. v3 publishes 3.x only.',
    ]);
  });

  it('refuses a release of a package that publishes from main', () => {
    const {errors} = checkV3({
      base: state(),
      head: state([{name: '@coveo/thermidor', type: 'minor'}]),
    });
    assert.deepEqual(errors, [
      'Release on v3 of packages that publish from main only: @coveo/thermidor (minor in .changeset/a.md). Open this change against main, so that the two lines never publish the same version.',
    ]);
  });

  it('reports a major of a package that publishes from main once', () => {
    const {errors} = checkV3({
      base: state(),
      head: state([{name: '@coveo/thermidor', type: 'major'}]),
    });
    assert.deepEqual(errors, [
      'Release on v3 of packages that publish from main only: @coveo/thermidor (major in .changeset/a.md). Open this change against main, so that the two lines never publish the same version.',
    ]);
  });

  it('allows picking up by hand a version that main published', () => {
    const pickedUp = PACKAGES.map((pkg) =>
      pkg.name === '@coveo/thermidor' ? {...pkg, version: '1.0.0'} : pkg
    );
    const {errors} = checkV3({base: state(), head: state([], {packages: pickedUp})});
    assert.deepEqual(errors, []);
  });

  it('allows a release of Bueno and Relay, which publish from v3 until GA', () => {
    const {errors, warnings} = checkV3({
      base: state(),
      head: state([
        {name: '@coveo/bueno', type: 'patch'},
        {name: '@coveo/relay', type: 'minor', file: '.changeset/b.md'},
      ]),
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
  });

  it('allows a range that removes the changesets of a package that publishes from main', () => {
    const {errors, warnings} = checkV3({
      base: state([{name: '@coveo/thermidor', type: 'minor'}]),
      head: state(),
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
  });

  it('warns about what v3 already plans instead of failing', () => {
    const pending = state([
      {name: '@coveo/quantic', type: 'major'},
      {name: '@coveo/thermidor', type: 'patch', file: '.changeset/b.md'},
    ]);
    const {errors, warnings} = checkV3({base: pending, head: pending});
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, [
      'v3 already plans a major version for @coveo/quantic. Remove those changesets: the version pull request fails on them.',
      'v3 already plans a release of packages that publish from main only: @coveo/thermidor. Remove those changesets before the next release from v3.',
    ]);
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
    assert.match(result.stdout, /UI-Kit major version on main: @coveo\/headless \(major in/);
  });

  it('fails on a changeset that mixes a paused package with a published one', () => {
    write(
      'packages/thermidor/package.json',
      JSON.stringify({name: '@coveo/thermidor', version: '0.8.0'})
    );
    write('.changeset/config.json', JSON.stringify({fixed: [], ignore: ['@coveo/headless']}));
    write(HEADLESS_GUIDE, '# Upgrade from v3 to v4\n');
    write(
      '.changeset/mixed.md',
      "---\n'@coveo/headless': minor\n'@coveo/thermidor': minor\n---\n\nMixed."
    );
    commit('mix a paused package with a published one');
    const result = run({UI_KIT_MAJOR_WINDOW: 'open'});
    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /error: \.changeset\/mixed\.md mixes packages that main holds back \(@coveo\/headless\)/
    );
  });

  it('fails on a major that targets v3, whatever the window', () => {
    const result = run({BASE_REF: 'refs/heads/v3'});
    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /error: Major version on v3: @coveo\/headless \(major in \.changeset\/break\.md\)\./
    );
    assert.equal(run({BASE_REF: 'v3', UI_KIT_MAJOR_WINDOW: 'open'}).status, 1);
  });

  it('skips a pull request that targets neither main nor v3', () => {
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
