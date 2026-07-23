import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ProjectMetadata} from './metadata.js';
import {
  provenancePath,
  readProvenance,
  readSampleMetadata,
  writeProvenance,
} from './provenance.js';

vi.mock('./log.js', () => ({
  log: {
    info: vi.fn(),
    step: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    note: vi.fn(),
  },
}));

const sampleMetadata: ProjectMetadata = {
  template: 'headless-search-react',
  templateVersion: '3.5.0',
  createdWith: 'create-ui@1.1.0',
  createdOn: '2026-07-03T13:41:00.000Z',
  dependencies: {'@coveo/headless': '4.1.0'},
  node: '22.10.0',
  packageManager: 'pnpm',
};

describe('provenance file I/O', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'create-ui-provenance-'));
  });
  afterEach(async () => {
    await rm(dir, {recursive: true, force: true});
  });

  describe('readSampleMetadata', () => {
    it('reads the version and Coveo dependencies from package.json', async () => {
      await writeFile(
        join(dir, 'package.json'),
        JSON.stringify({
          name: '@coveo/ui-kit-sample-headless-search-react',
          version: '3.5.0',
          dependencies: {'@coveo/headless': '4.1.0', react: '18.0.0'},
        })
      );

      const result = await readSampleMetadata(dir);

      expect(result.templateVersion).toBe('3.5.0');
      expect(result.dependencies).toEqual({'@coveo/headless': '4.1.0'});
    });
  });

  describe('writeProvenance', () => {
    it('writes pretty-printed JSON to .coveo/create-ui.json', async () => {
      const ok = await writeProvenance(dir, sampleMetadata);

      expect(ok).toBe(true);
      const written = await readFile(provenancePath(dir), 'utf8');
      expect(JSON.parse(written)).toEqual(sampleMetadata);
      expect(written.endsWith('\n')).toBe(true);
    });

    it('warns and returns false instead of throwing when the write fails', async () => {
      const fileAsProjectRoot = join(dir, 'not-a-dir');
      await writeFile(fileAsProjectRoot, 'x');

      const ok = await writeProvenance(fileAsProjectRoot, sampleMetadata);

      expect(ok).toBe(false);
    });
  });

  describe('readProvenance', () => {
    it('reads back what writeProvenance wrote', async () => {
      await writeProvenance(dir, sampleMetadata);

      expect(await readProvenance(dir)).toEqual(sampleMetadata);
    });

    it('returns null when the provenance file is absent', async () => {
      expect(await readProvenance(dir)).toBeNull();
    });
  });
});
