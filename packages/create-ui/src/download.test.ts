import {mkdtemp, rm, mkdir, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('pacote', () => ({
  default: {
    extract: vi.fn(),
  },
}));

import pacote from 'pacote';
import {downloadTemplate} from './download.js';

describe('downloadTemplate', () => {
  let destDir: string;

  beforeEach(async () => {
    destDir = await mkdtemp(join(tmpdir(), 'create-ui-test-'));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(destDir, {recursive: true, force: true});
  });

  it('calls pacote.extract with the package name and dest', async () => {
    vi.mocked(pacote.extract).mockImplementation(async (_spec, dest) => {
      await mkdir(dest as string, {recursive: true});
      await writeFile(join(dest as string, 'package.json'), '{}');
      return {from: '', resolved: '', integrity: ''} as any;
    });

    const result = await downloadTemplate({
      packageName: '@coveo/sample-x',
      destDir,
    });

    expect(pacote.extract).toHaveBeenCalledWith('@coveo/sample-x', destDir);
    expect(result).toBe(destDir);
  });

  it('throws when extracted package has no package.json', async () => {
    vi.mocked(pacote.extract).mockResolvedValue({
      from: '',
      resolved: '',
      integrity: '',
    } as any);

    await expect(
      downloadTemplate({packageName: '@coveo/sample-x', destDir})
    ).rejects.toThrow(/not a valid package/);
  });
});
