import {mkdtemp, rm, mkdir, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('pacote', () => ({
  default: {
    extract: vi.fn(),
    packument: vi.fn(),
  },
}));

import pacote from 'pacote';
import {downloadTemplate, TemplateVersionUnavailableError} from './download.js';

const extractWritesPackageJson = async (_spec: string, dest: string) => {
  await mkdir(dest, {recursive: true});
  await writeFile(join(dest, 'package.json'), '{}');
  return {from: '', resolved: '', integrity: ''} as any;
};

const packument = (distTags: Record<string, string>, versions: string[]) =>
  ({
    name: '@coveo/sample-x',
    'dist-tags': distTags,
    versions: Object.fromEntries(versions.map((v) => [v, {}])),
  }) as any;

describe('downloadTemplate', () => {
  let destDir: string;

  beforeEach(async () => {
    destDir = await mkdtemp(join(tmpdir(), 'create-ui-test-'));
  });

  afterEach(async () => {
    vi.resetAllMocks();
    await rm(destDir, {recursive: true, force: true});
  });

  it('extracts the bare package name and skips the packument when no version is given', async () => {
    vi.mocked(pacote.extract).mockImplementation(extractWritesPackageJson as any);

    const result = await downloadTemplate({
      packageName: '@coveo/sample-x',
      destDir,
    });

    expect(pacote.packument).not.toHaveBeenCalled();
    expect(pacote.extract).toHaveBeenCalledWith('@coveo/sample-x', destDir, expect.anything());
    expect(result).toBe(destDir);
  });

  it('extracts the exact version when it is published', async () => {
    vi.mocked(pacote.packument).mockResolvedValue(packument({latest: '3.2.1'}, ['3.1.0', '3.2.1']));
    vi.mocked(pacote.extract).mockImplementation(extractWritesPackageJson as any);

    await downloadTemplate({
      packageName: '@coveo/sample-x',
      destDir,
      version: '3.2.1',
    });

    expect(pacote.extract).toHaveBeenCalledWith(
      '@coveo/sample-x@3.2.1',
      destDir,
      expect.anything()
    );
  });

  it('accepts a dist-tag that exists on the packument', async () => {
    vi.mocked(pacote.packument).mockResolvedValue(
      packument({latest: '3.2.1', next: '4.0.0-next.0'}, ['3.2.1', '4.0.0-next.0'])
    );
    vi.mocked(pacote.extract).mockImplementation(extractWritesPackageJson as any);

    await downloadTemplate({
      packageName: '@coveo/sample-x',
      destDir,
      version: 'next',
    });

    expect(pacote.extract).toHaveBeenCalledWith('@coveo/sample-x@next', destDir, expect.anything());
  });

  it('throws TemplateVersionUnavailableError without extracting when the version is absent', async () => {
    vi.mocked(pacote.packument).mockResolvedValue(packument({latest: '3.2.1'}, ['3.1.0', '3.2.1']));

    await expect(
      downloadTemplate({
        packageName: '@coveo/sample-x',
        destDir,
        version: '99.99.99',
      })
    ).rejects.toBeInstanceOf(TemplateVersionUnavailableError);
    expect(pacote.extract).not.toHaveBeenCalled();
  });
});
