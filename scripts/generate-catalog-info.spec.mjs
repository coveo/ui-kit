import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';

import {readCatalogInfo} from './generate-catalog-info.mjs';

const tempDirs = [];
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function makeTempDir() {
  const directory = mkdtempSync(join(tmpdir(), 'catalog-info-'));
  tempDirs.push(directory);
  return directory;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const directory = tempDirs.pop();
    rmSync(directory, {recursive: true, force: true});
  }
});

describe('readCatalogInfo', () => {
  it('returns parsed catalog metadata when the config file exists', () => {
    const directory = makeTempDir();
    writeFileSync(
      join(directory, 'catalog-info.config.json'),
      JSON.stringify({owner: 'group:default/dxui', lifecycle: 'production'})
    );

    assert.deepEqual(readCatalogInfo(directory), {
      owner: 'group:default/dxui',
      lifecycle: 'production',
    });
  });

  it('returns undefined when the config file does not exist', () => {
    const directory = makeTempDir();

    assert.equal(readCatalogInfo(directory), undefined);
  });

  it('throws a contextual parse error when the config file contains invalid JSON', () => {
    const directory = makeTempDir();
    writeFileSync(join(directory, 'catalog-info.config.json'), '{');

    assert.throws(() => readCatalogInfo(directory), {
      message: /Failed to parse .*catalog-info\.config\.json/,
    });
  });

  it('throws a contextual load error when the config path is not a file', () => {
    const directory = makeTempDir();
    mkdirSync(join(directory, 'catalog-info.config.json'));

    assert.throws(() => readCatalogInfo(directory), {
      message: /Failed to load .*catalog-info\.config\.json/,
    });
  });

  it('does not run main when the script is imported as a module', () => {
    const result = spawnSync(
      'node',
      [
        '--input-type=module',
        '-e',
        "await import('./scripts/generate-catalog-info.mjs');",
      ],
      {cwd: repoRoot, encoding: 'utf-8'}
    );

    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
  });

  it('runs main when the script is executed directly', () => {
    const result = spawnSync('node', ['scripts/generate-catalog-info.mjs'], {
      cwd: repoRoot,
      encoding: 'utf-8',
    });

    assert.equal(result.status, 0);
    assert.match(
      result.stdout,
      /Done\. Generated 9 component files \+ 2 root files\./
    );
    assert.equal(result.stderr, '');
  });
});
