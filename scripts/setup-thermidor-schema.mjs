#!/usr/bin/env node

import {spawn} from 'node:child_process';
import {cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const submodulePath = join('packages', 'thermidor-schema');
const packagePath = join(submodulePath, 'packages', 'typescript');

export const THERMIDOR_SCHEMA_NPM_FALLBACK = Object.freeze({
  // Keep this disabled until @coveo/thermidor-schema is published to npm.
  enabled: false,
  packageSpec: '@coveo/thermidor-schema@0.1.0',
});

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
    const child = spawn(executable, args, {
      cwd: options.cwd,
      stdio: 'inherit',
    });

    child.once('error', rejectPromise);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(
          `${command} ${args.join(' ')} failed${
            signal ? ` with signal ${signal}` : ` with exit code ${code}`
          }`
        )
      );
    });
  });
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function assertEmptyFallbackTarget(targetPath) {
  if (!(await pathExists(targetPath))) {
    return;
  }

  const entries = await readdir(targetPath);
  if (entries.length !== 0) {
    throw new Error(`Refusing to replace non-empty Thermidor schema path: ${targetPath}`);
  }
}

async function materializeNpmPackage({fallback, repoRoot, run}) {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'thermidor-schema-npm-'));
  const targetRoot = join(repoRoot, submodulePath);
  const targetPackage = join(repoRoot, packagePath);

  try {
    await run(
      'npm',
      [
        'install',
        '--prefix',
        temporaryDirectory,
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        '--save=false',
        fallback.packageSpec,
      ],
      {cwd: repoRoot}
    );

    const installedPackage = join(temporaryDirectory, 'node_modules', '@coveo', 'thermidor-schema');
    for (const requiredPath of [
      'package.json',
      join('dist', 'index.js'),
      join('dist', 'index.d.ts'),
      'schema',
    ]) {
      if (!(await pathExists(join(installedPackage, requiredPath)))) {
        throw new Error(
          `${fallback.packageSpec} is missing required packaged path ${requiredPath}`
        );
      }
    }

    await assertEmptyFallbackTarget(targetRoot);
    await rm(targetRoot, {force: true, recursive: true});
    await mkdir(dirname(targetPackage), {recursive: true});
    await cp(installedPackage, targetPackage, {recursive: true});

    const manifestPath = join(targetPackage, 'package.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    delete manifest.scripts;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    console.warn(
      `Thermidor schema submodule unavailable; materialized ${fallback.packageSpec} from npm.`
    );
  } finally {
    await rm(temporaryDirectory, {force: true, recursive: true});
  }
}

export async function ensureThermidorSchema({
  fallback = THERMIDOR_SCHEMA_NPM_FALLBACK,
  repoRoot = repositoryRoot,
  run = runCommand,
} = {}) {
  try {
    await run('git', ['submodule', 'update', '--init', submodulePath], {
      cwd: repoRoot,
    });
    return 'submodule';
  } catch (submoduleError) {
    if (!fallback.enabled) {
      throw new Error(
        `Thermidor schema submodule initialization failed and the npm fallback is disabled. ` +
          `The fallback is pinned to ${fallback.packageSpec} and can be enabled after that package is published.`,
        {cause: submoduleError}
      );
    }

    await materializeNpmPackage({fallback, repoRoot, run});
    return 'npm';
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureThermidorSchema().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
