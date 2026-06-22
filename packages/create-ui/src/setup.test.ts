import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {finalizePackageJson, finalizeProject, toPackageName} from './setup.js';

describe('toPackageName', () => {
  it('lowercases and uses the final path segment', () => {
    expect(toPackageName('My-App')).toBe('my-app');
    expect(toPackageName('some/path/My App')).toBe('my-app');
  });
});

describe('finalizePackageJson', () => {
  it('renames the package and strips the private flag', () => {
    const result = finalizePackageJson(
      {name: '@samples/headless-search-react', private: true, foo: 'bar'},
      'my-app'
    );
    expect(result.name).toBe('my-app');
    expect(result.private).toBeUndefined();
    expect(result.version).toBe('0.1.0');
    expect(result.foo).toBe('bar');
  });
});

describe('finalizeProject (IO)', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'create-ui-setup-'));
  });
  afterEach(async () => {
    await rm(dir, {recursive: true, force: true});
  });

  async function exists(p: string): Promise<boolean> {
    try {
      await access(p);
      return true;
    } catch {
      return false;
    }
  }

  it('rewrites package.json, adds .gitignore, and moves to the target', async () => {
    const sampleDir = join(dir, 'extracted');
    await mkdir(sampleDir, {recursive: true});
    await writeFile(
      join(sampleDir, 'package.json'),
      JSON.stringify({name: '@samples/x', private: true})
    );
    const targetDir = join(dir, 'my-app');

    await finalizeProject({sampleDir, targetDir, projectName: 'my-app'});

    expect(await exists(sampleDir)).toBe(false);
    expect(await exists(join(targetDir, '.gitignore'))).toBe(true);
    const pkg = JSON.parse(
      await readFile(join(targetDir, 'package.json'), 'utf8')
    );
    expect(pkg.name).toBe('my-app');
    expect(pkg.private).toBeUndefined();
  });
});
