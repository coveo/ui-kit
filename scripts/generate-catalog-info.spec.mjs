import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';

import {readCatalogInfo} from './generate-catalog-info.mjs';

const tempDirs = [];

function makeTempDir() {
  const directory = mkdtempSync(join(tmpdir(), 'catalog-info-'));
  tempDirs.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of tempDirs.splice(0)) {
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
});
