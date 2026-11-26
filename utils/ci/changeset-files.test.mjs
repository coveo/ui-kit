import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {after, before, describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';

describe('changeset-files', () => {
  const script = join(dirname(fileURLToPath(import.meta.url)), 'changeset-files.mjs');
  let home;
  let repo;
  let env;

  function git(...args) {
    return execFileSync('git', args, {cwd: repo, env, encoding: 'utf8'}).trim();
  }

  function write(path, content) {
    mkdirSync(dirname(join(repo, path)), {recursive: true});
    writeFileSync(join(repo, path), content);
  }

  function run(...args) {
    return spawnSync(process.execPath, [script, ...args], {cwd: repo, env, encoding: 'utf8'});
  }

  before(() => {
    home = mkdtempSync(join(tmpdir(), 'changeset-files-home-'));
    repo = mkdtempSync(join(tmpdir(), 'changeset-files-repo-'));
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
      'packages/thermidor/package.json',
      JSON.stringify({name: '@coveo/thermidor', version: '0.8.0'})
    );
    write(
      'packages/playground/package.json',
      JSON.stringify({name: '@coveo/playground', version: '0.0.0', private: true})
    );
    write(
      '.changeset/config.json',
      JSON.stringify({
        fixed: [],
        ignore: ['@coveo/headless'],
        privatePackages: {version: false, tag: false},
      })
    );
    write('.changeset/README.md', 'Changesets.');
    write('.changeset/break.md', "---\n'@coveo/headless': major\n---\n\nBreak.");
    write('.changeset/feature.md', "---\n'@coveo/thermidor': minor\n---\n\nFeature.");
    write('.changeset/play.md', "---\n'@coveo/playground': patch\n---\n\nPrivate.");
    git('add', '--all');
    git('commit', '--quiet', '--no-gpg-sign', '--message', 'base');
  });

  after(() => {
    rmSync(repo, {recursive: true, force: true});
    rmSync(home, {recursive: true, force: true});
  });

  it('prints the files that changeset version consumes', () => {
    const result = run('--to-version');
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '.changeset/feature.md\n');
  });

  it('prints the files that Changesets keeps for later', () => {
    const result = run('--held');
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '.changeset/break.md\n.changeset/play.md\n');
  });

  it('asks for exactly one of the two options', () => {
    assert.equal(run().status, 2);
    assert.equal(run('--to-version', '--held').status, 2);
  });
});
