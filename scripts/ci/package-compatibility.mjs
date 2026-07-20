import {execFile} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {EOL} from 'node:os';
import {dirname, join} from 'node:path';
import {promisify} from 'node:util';
import {publint} from 'publint';

const runCommand = promisify(execFile);

const WORKSPACE_ROOTS = ['packages', 'samples', 'utils'];
const EXCLUDED_PACKAGES = new Set(['@coveo/quantic']);
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'publish',
  'target',
]);

function findPublicPackages(rootDir) {
  const packages = [];

  for (const entry of readdirSync(rootDir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        packages.push(...findPublicPackages(join(rootDir, entry.name)));
      }
      continue;
    }

    if (entry.name !== 'package.json') {
      continue;
    }

    const packageJsonPath = join(rootDir, entry.name);
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    if (pkg.name && !pkg.private && !EXCLUDED_PACKAGES.has(pkg.name)) {
      packages.push({pkg, pkgDir: dirname(packageJsonPath)});
    }
  }

  return packages;
}

async function getPublishedPackageDir({pkg, pkgDir}) {
  const publishedPackageDir = pkg.publishConfig?.directory
    ? join(pkgDir, pkg.publishConfig.directory)
    : pkgDir;

  if (pkg.publishConfig?.directory && pkg.scripts?.prepack) {
    await runCommand('pnpm', ['run', 'prepack'], {cwd: pkgDir});
  }

  if (!existsSync(join(publishedPackageDir, 'package.json'))) {
    throw new Error(`Unable to find the package artifact for ${pkg.name}.`);
  }

  return {
    pack: pkg.publishConfig?.directory ? false : 'auto',
    pkgDir: publishedPackageDir,
  };
}

const packages = WORKSPACE_ROOTS.flatMap(findPublicPackages).sort((a, b) =>
  a.pkgDir.localeCompare(b.pkgDir)
);
const packagesToScan = await Promise.all(packages.map(getPublishedPackageDir));

let exitCode = 0;

const issues = await Promise.all(
  packagesToScan.map(async ({pack, pkgDir}) => {
    const {messages} = await publint({
      pack,
      pkgDir,
      level: 'suggestion',
      strict: false,
    });

    const suggestions = [];
    const warnings = [];
    const errors = [];

    for (const message of messages) {
      switch (message.type) {
        case 'suggestion':
          suggestions.push(message);
          break;
        case 'warning':
          warnings.push(message);
          break;
        case 'error':
          errors.push(message);
          break;
      }
    }

    return {
      pkgDir,
      suggestions,
      warnings,
      errors,
    };
  })
);

function prettyPrintJSON(label, jsonObject, logFunction) {
  logFunction(`${label}:`, EOL);
  logFunction(JSON.stringify(jsonObject, null, 2), EOL);
}

if (issues.length > 0) {
  console.info('The publint scan detected compatibility issues:\n');

  for (const {errors, warnings, suggestions, pkgDir} of issues) {
    console.group(`\n********** ${pkgDir} **********\n`);
    if (errors.length > 0) {
      exitCode = 1;
      prettyPrintJSON('Errors', errors, console.error);
    }
    if (warnings.length > 0) {
      prettyPrintJSON('Warnings', warnings, console.warn);
    }
    if (suggestions.length > 0) {
      prettyPrintJSON('Suggestions', suggestions, console.info);
    }
    console.groupEnd();
  }
} else {
  console.info('No compatibility issues found by publint.');
}

process.exit(exitCode);
