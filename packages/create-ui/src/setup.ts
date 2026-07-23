import {spawnSync} from 'node:child_process';
import {cp, readFile, rm, writeFile} from 'node:fs/promises';
import {basename, join} from 'node:path';
import type {PackageJson} from './types.js';
import {getPackageManager} from './utils.js';

export function toPackageName(projectName: string): string {
  const defaultName = 'my-app';
  return (
    basename(projectName)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '') || defaultName
  );
}

export function stripMonorepoFields(
  pkg: PackageJson,
  projectName: string
): PackageJson {
  const next: PackageJson = {...pkg, name: toPackageName(projectName)};
  delete next.private;
  // Published samples carry the monorepo's repository (for npm provenance); a
  // scaffolded standalone project must not inherit coveo/ui-kit as its repo.
  delete next.repository;
  next.version = '0.1.0';
  return next;
}

export async function rewritePackageJson(
  dir: string,
  projectName: string
): Promise<void> {
  const pkgPath = join(dir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as PackageJson;
  await writeFile(
    pkgPath,
    `${JSON.stringify(stripMonorepoFields(pkg, projectName), null, 2)}\n`
  );
}

export async function moveToTarget(
  sourceDir: string,
  targetDir: string
): Promise<void> {
  if (sourceDir === targetDir) {
    return;
  }
  await cp(sourceDir, targetDir, {recursive: true});
  await rm(sourceDir, {recursive: true, force: true});
}

export function installDependencies(targetDir: string): boolean {
  const result = spawnSync(getPackageManager(), ['install'], {
    cwd: targetDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}
