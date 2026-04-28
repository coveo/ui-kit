import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {afterEach, test} from 'node:test';
import {fileURLToPath} from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const scriptPath = join(currentDirPath, '..', 'write-prod-dep-changeset.mjs');

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    rmSync(dir, {recursive: true, force: true});
  }
});

test('merges existing changeset entries when a new production dependency update is added', () => {
  const repoDir = createTempGitRepo();

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    version: '1.0.0',
    dependencies: {dep: '1.0.0'},
  });

  writeJson(repoDir, 'packages/atomic/package.json', {
    name: '@coveo/atomic',
    version: '1.0.0',
    dependencies: {dep: '1.0.0'},
  });

  commit(repoDir, 'initial packages');

  const baseSha = revParse(repoDir, 'HEAD');

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    version: '1.0.0',
    dependencies: {dep: '1.1.0'},
  });

  commit(repoDir, 'update headless prod dependency');
  const firstHeadSha = revParse(repoDir, 'HEAD');

  runGenerator(repoDir, baseSha, firstHeadSha);
  const firstChangeset = readFileSync(
    join(repoDir, '.changeset/bump-prod-deps.md'),
    'utf8'
  );
  assert.match(firstChangeset, /'@coveo\/headless': patch/);
  assert.doesNotMatch(firstChangeset, /'@coveo\/atomic': patch/);

  writeJson(repoDir, 'packages/atomic/package.json', {
    name: '@coveo/atomic',
    version: '1.0.0',
    dependencies: {dep: '1.2.0'},
  });

  commit(repoDir, 'update atomic prod dependency');
  const secondHeadSha = revParse(repoDir, 'HEAD');

  runGenerator(repoDir, baseSha, secondHeadSha);

  const mergedChangeset = readFileSync(
    join(repoDir, '.changeset/bump-prod-deps.md'),
    'utf8'
  );

  assert.match(mergedChangeset, /'@coveo\/headless': patch/);
  assert.match(mergedChangeset, /'@coveo\/atomic': patch/);
  assert.match(mergedChangeset, /---\n\nUpdate production dependencies\n/);
});

test('ignores devDependency-only changes', () => {
  const repoDir = createTempGitRepo();

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    version: '1.0.0',
    devDependencies: {dep: '1.0.0'},
  });

  commit(repoDir, 'initial headless');

  const baseSha = revParse(repoDir, 'HEAD');

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    version: '1.0.0',
    devDependencies: {dep: '1.1.0'},
  });

  commit(repoDir, 'update headless dev dependency');
  const headSha = revParse(repoDir, 'HEAD');

  runGenerator(repoDir, baseSha, headSha);

  assert.equal(
    fileExists(repoDir, '.changeset/bump-prod-deps.md'),
    false,
    'No changeset should be generated for dev dependency updates only'
  );
});

test('ignores production dependency updates in private packages', () => {
  const repoDir = createTempGitRepo();

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    private: true,
    version: '1.0.0',
    dependencies: {dep: '1.0.0'},
  });

  commit(repoDir, 'initial private headless package');

  const baseSha = revParse(repoDir, 'HEAD');

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    private: true,
    version: '1.0.0',
    dependencies: {dep: '1.1.0'},
  });

  commit(repoDir, 'update private package prod dependency');
  const headSha = revParse(repoDir, 'HEAD');

  runGenerator(repoDir, baseSha, headSha);

  assert.equal(
    fileExists(repoDir, '.changeset/bump-prod-deps.md'),
    false,
    'No changeset should be generated for private packages'
  );
});

test('preserves existing bump types when merging new packages', () => {
  const repoDir = createTempGitRepo();

  writeJson(repoDir, 'packages/headless/package.json', {
    name: '@coveo/headless',
    version: '1.0.0',
    dependencies: {dep: '1.0.0'},
  });

  writeJson(repoDir, 'packages/atomic/package.json', {
    name: '@coveo/atomic',
    version: '1.0.0',
    dependencies: {dep: '1.0.0'},
  });

  writeFileSync(
    join(repoDir, '.changeset/bump-prod-deps.md'),
    "---\n'@coveo/headless': major\n---\n\nUpdate production dependencies\n"
  );

  commit(repoDir, 'initial state with existing major changeset');

  const baseSha = revParse(repoDir, 'HEAD');

  writeJson(repoDir, 'packages/atomic/package.json', {
    name: '@coveo/atomic',
    version: '1.0.0',
    dependencies: {dep: '1.1.0'},
  });

  commit(repoDir, 'update atomic prod dependency');
  const headSha = revParse(repoDir, 'HEAD');

  runGenerator(repoDir, baseSha, headSha);

  const changeset = readFileSync(
    join(repoDir, '.changeset/bump-prod-deps.md'),
    'utf8'
  );
  assert.match(changeset, /'@coveo\/headless': major/);
  assert.match(changeset, /'@coveo\/atomic': patch/);
});

function createTempGitRepo() {
  const repoDir = mkdtempSync(join(tmpdir(), 'ui-kit-renovate-prod-test-'));
  tempDirs.push(repoDir);

  mkdirSync(join(repoDir, '.changeset'), {recursive: true});
  mkdirSync(join(repoDir, 'packages/headless'), {recursive: true});
  mkdirSync(join(repoDir, 'packages/atomic'), {recursive: true});

  runGit(repoDir, ['init']);
  runGit(repoDir, ['config', 'user.email', 'test@example.com']);
  runGit(repoDir, ['config', 'user.name', 'Test Runner']);

  return repoDir;
}

function writeJson(repoDir, relativePath, value) {
  writeFileSync(
    join(repoDir, relativePath),
    `${JSON.stringify(value, null, 2)}\n`
  );
}

function commit(repoDir, message) {
  runGit(repoDir, ['add', '.']);
  runGit(repoDir, ['commit', '-m', message]);
}

function revParse(repoDir, ref) {
  return runGit(repoDir, ['rev-parse', ref]).trim();
}

function runGenerator(repoDir, baseSha, headSha) {
  execFileSync('node', [scriptPath], {
    cwd: repoDir,
    env: {
      ...process.env,
      BASE_SHA: baseSha,
      HEAD_SHA: headSha,
    },
    stdio: 'pipe',
  });
}

function runGit(repoDir, args) {
  return execFileSync('git', args, {
    cwd: repoDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function fileExists(repoDir, relativePath) {
  try {
    readFileSync(join(repoDir, relativePath), 'utf8');
    return true;
  } catch {
    return false;
  }
}
