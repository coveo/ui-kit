import {createReadStream} from 'node:fs';
import {access, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {create} from 'tar';
import {extractPackage} from './download.js';

// npm tarballs wrap every entry under a top-level `package/` directory.
const PKG_ROOT = 'package';
const FIXTURE_FILES = ['package.json', 'src/main.tsx', 'README.md'];

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function makeTarball(
  workDir: string,
  entries: string[],
  name = 'fixture.tgz'
): Promise<string> {
  const srcDir = join(workDir, name.replace('.tgz', ''));
  for (const file of entries) {
    const full = join(srcDir, PKG_ROOT, file);
    await mkdir(dirname(full), {recursive: true});
    await writeFile(full, `// ${file}\n`);
  }
  const tarballPath = join(workDir, name);
  await create({gzip: true, cwd: srcDir, file: tarballPath}, [PKG_ROOT]);
  return tarballPath;
}

describe('extractPackage', () => {
  let workDir: string;
  let destDir: string;

  beforeEach(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'create-ui-test-'));
    destDir = join(workDir, 'out');
  });

  afterEach(async () => {
    await rm(workDir, {recursive: true, force: true});
  });

  it('extracts the package contents, stripping the package/ prefix', async () => {
    const tarball = await makeTarball(workDir, FIXTURE_FILES);
    await extractPackage(createReadStream(tarball), destDir);

    expect(await exists(join(destDir, 'package.json'))).toBe(true);
    expect(await exists(join(destDir, 'src/main.tsx'))).toBe(true);
    expect(await exists(join(destDir, 'README.md'))).toBe(true);
    // the `package/` wrapper is stripped, not nested under destDir
    expect(await exists(join(destDir, 'package'))).toBe(false);
  });

  it('throws when the archive has no package.json', async () => {
    const tarball = await makeTarball(workDir, ['src/main.tsx'], 'nopkg.tgz');
    await expect(
      extractPackage(createReadStream(tarball), destDir)
    ).rejects.toThrow(/not a valid package/);
  });
});
