/**
 * Finalizes a scaffolded project: renames the package, removes monorepo-only
 * fields, ensures a .gitignore, moves it into place, and installs dependencies.
 */

import {spawnSync} from 'node:child_process';
import {cp, readFile, rm, writeFile, access} from 'node:fs/promises';
import {basename, join} from 'node:path';
import type {PackageManager} from './utils.js';

interface PackageJson {
  name?: string;
  private?: boolean;
  version?: string;
  [key: string]: unknown;
}

const DEFAULT_GITIGNORE = ['node_modules', 'dist', '.DS_Store', ''].join('\n');

/**
 * Turns a project name or path into a valid npm package name (lowercase,
 * spaces collapsed to dashes). Uses the final path segment.
 */
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

/**
 * Pure: returns a new package.json renamed for the user's project, with the
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

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Returns the install command for the detected package manager. */
export function installCommand(pm: PackageManager): {
  command: string;
  args: string[];
} {
  return {command: pm, args: ['install']};
}

/**
 * Finalizes the extracted sample into the target project directory:
 * rewrites package.json, ensures a .gitignore, and copies it into place.
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

  if (!(await exists(join(sampleDir, '.gitignore')))) {
    await writeFile(join(sampleDir, '.gitignore'), `${DEFAULT_GITIGNORE}\n`);
  }

  // Copy out of the temp extraction tree into the user's target directory.
  if (sampleDir !== targetDir) {
    await cp(sampleDir, targetDir, {recursive: true});
    await rm(sampleDir, {recursive: true, force: true});
  }
}

/** Runs `<pm> install` in the target directory. Returns true on success. */
export function installDependencies(
  targetDir: string,
  pm: PackageManager
): boolean {
  const {command, args} = installCommand(pm);
  const result = spawnSync(command, args, {
    cwd: targetDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}
