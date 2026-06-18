import {createReadStream} from 'node:fs';
import {mkdir, mkdtemp, rm, writeFile, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {create} from 'tar';
import {extractSampleFromTarball, fetchWithRetry} from './download.js';

const ROOT = 'ui-kit-deadbeef';

/** Files placed inside the fixture tarball (paths relative to the repo root). */
const FIXTURE_FILES = [
  'pnpm-workspace.yaml',
  'packages/headless/package.json',
  'packages/atomic/package.json',
  // unrelated package file that must NOT be extracted (only package.json)
  'packages/atomic/src/index.ts',
  // the target sample
  'samples/headless/search-react/package.json',
  'samples/headless/search-react/src/main.tsx',
  // a different sample that must NOT be extracted
  'samples/headless/commerce-react/package.json',
];

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('extractSampleFromTarball', () => {
  let workDir: string;
  let tarballPath: string;
  let destDir: string;

  beforeEach(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'create-ui-test-'));
    const srcDir = join(workDir, 'src');
    // Build the fixture tree under `<srcDir>/ui-kit-deadbeef/...`
    for (const file of FIXTURE_FILES) {
      const full = join(srcDir, ROOT, file);
      await mkdir(dirname(full), {recursive: true});
      await writeFile(full, `// ${file}\n`);
    }
    tarballPath = join(workDir, 'fixture.tar.gz');
    await create({gzip: true, cwd: srcDir, file: tarballPath}, [ROOT]);
    destDir = join(workDir, 'out');
  });

  afterEach(async () => {
    await rm(workDir, {recursive: true, force: true});
  });

  it('extracts the sample dir, strips the root prefix, and returns its path', async () => {
    const sampleDir = await extractSampleFromTarball(
      createReadStream(tarballPath),
      {samplePath: 'samples/headless/search-react', destDir}
    );

    expect(sampleDir).toBe(join(destDir, 'samples/headless/search-react'));
    expect(await exists(join(sampleDir, 'package.json'))).toBe(true);
    expect(await exists(join(sampleDir, 'src/main.tsx'))).toBe(true);
  });

  it('extracts support files (pnpm-workspace.yaml + packages/*/package.json)', async () => {
    await extractSampleFromTarball(createReadStream(tarballPath), {
      samplePath: 'samples/headless/search-react',
      destDir,
    });

    expect(await exists(join(destDir, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await exists(join(destDir, 'packages/headless/package.json'))).toBe(
      true
    );
    expect(await exists(join(destDir, 'packages/atomic/package.json'))).toBe(
      true
    );
  });

  it('does not extract other samples or non-package files', async () => {
    await extractSampleFromTarball(createReadStream(tarballPath), {
      samplePath: 'samples/headless/search-react',
      destDir,
    });

    expect(await exists(join(destDir, 'samples/headless/commerce-react'))).toBe(
      false
    );
    expect(await exists(join(destDir, 'packages/atomic/src'))).toBe(false);
  });
});

describe('fetchWithRetry', () => {
  it('returns the response on the first successful attempt', async () => {
    const ok = {ok: true, body: {}} as unknown as Response;
    const fetchImpl = vi.fn().mockResolvedValue(ok);
    const result = await fetchWithRetry('http://x', {fetchImpl});
    expect(result).toBe(ok);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries once after a network failure', async () => {
    const ok = {ok: true, body: {}} as unknown as Response;
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(ok);
    const result = await fetchWithRetry('http://x', {fetchImpl});
    expect(result).toBe(ok);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('throws a clear error after exhausting retries', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
    await expect(
      fetchWithRetry('http://x', {retries: 1, fetchImpl})
    ).rejects.toThrow(/Failed to download the sample/);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('treats a non-ok response as a failure', async () => {
    const notFound = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response;
    const fetchImpl = vi.fn().mockResolvedValue(notFound);
    await expect(
      fetchWithRetry('http://x', {retries: 0, fetchImpl})
    ).rejects.toThrow(/404 Not Found/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
