/**
 * Finalizes a scaffolded project: renames the package, removes monorepo-only
 * fields, moves it into place, and installs dependencies.
 */

import {spawnSync} from 'node:child_process';
import {cp, readFile, rm, writeFile} from 'node:fs/promises';
import {basename, join} from 'node:path';
import type {PackageJson} from './types.js';
import {getPackageManager} from './utils.js';

/**
 * Turns a project name or path into a valid npm package name (lowercase,
 * spaces collapsed to dashes). Uses the final path segment.
 */
export function toPackageName(projectName: string): string {
  const defaultName = 'my-app';
  const name =
    basename(projectName)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '') || defaultName;

  if (!name) {
    throw new Error(`Invalid project name "${projectName}".`);
  }

  return name;
}

/**
 * Returns a new package.json renamed for the user's project, with the
 * monorepo-only `private` flag removed and the version reset.
 */
export function finalizePackageJson(
  pkg: PackageJson,
  projectName: string
): PackageJson {
  const next: PackageJson = {...pkg, name: toPackageName(projectName)};
  delete next.private;
  next.version = '0.1.0';
  return next;
}

/**
 * Finalizes the extracted sample into the target project directory:
 * rewrites package.json and copies it into place.
 */
export async function finalizeProject(options: {
  sampleDir: string;
  targetDir: string;
  projectName: string;
}): Promise<void> {
  const {sampleDir, targetDir, projectName} = options;

  const pkgPath = join(sampleDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as PackageJson;
  await writeFile(
    pkgPath,
    `${JSON.stringify(finalizePackageJson(pkg, projectName), null, 2)}\n`
  );

  // Copy out of the temp extraction tree into the user's target directory.
  if (sampleDir !== targetDir) {
    await cp(sampleDir, targetDir, {recursive: true});
    await rm(sampleDir, {recursive: true, force: true});
  }
}

/** Runs the detected package manager's install in `targetDir`. Returns true on success. */
export function installDependencies(targetDir: string): boolean {
  const result = spawnSync(getPackageManager(), ['install'], {
    cwd: targetDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}
