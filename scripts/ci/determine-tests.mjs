#!/usr/bin/env node
import {readdirSync, statSync} from 'node:fs';
import {EOL} from 'node:os';
import {basename, dirname, join, relative} from 'node:path';
import {setOutput} from '@actions/core';
import {getBaseHeadSHAs, getChangedFiles} from './git-utils.mjs';
import {getAllHeadlessAffectedEndpoints} from './headless-dependency-tracker.mjs';
import {ensureFileExists, listImports} from './list-imports.mjs';

class NoRelevantChangesError extends Error {
  constructor() {
    super('No changes that would affect Atomic were detected. Skipping tests.');
    this.name = 'NoRelevantChangesError';
  }
}

class DependentPackageChangeError extends Error {
  constructor(file) {
    super(
      `Changes detected in a package on which Atomic depend: ${file}. Running all tests.`
    );
    this.name = 'DependentPackageChangeError';
    this.file = file;
  }
}

class PackageJsonChangeError extends Error {
  constructor(file) {
    super(
      `Changes detected in a package.json or package-lock.json file: ${file}. Running all tests.`
    );
    this.name = 'PackageJsonChangeError';
    this.file = file;
  }
}

class RunAllTestsInMergeQueueError extends Error {
  constructor() {
    super(`In a merge queue. Running all tests.`);
    this.name = 'RunAllTestsInMergeQueueError';
  }
}

/**
 * Recursively finds all end-to-end test files with the `.e2e.ts` extension in a given directory.
 *
 * @param {string} dir - The directory to search for test files.
 * @returns {string[]} An array of paths to the found test files.
 */
function findAllTestFiles(dir) {
  function searchFiles(currentDir, testFiles) {
    const files = readdirSync(currentDir);

    for (const file of files) {
      const fullPath = join(currentDir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        searchFiles(fullPath, testFiles);
      } else if (fullPath.endsWith('.e2e.ts')) {
        testFiles.push(fullPath);
      }
    }

    return testFiles;
  }

  return searchFiles(dir, []);
}

/**
 * Creates a mapping of test file names to their respective import dependencies.
 *
 * @param {string[]} testPaths - An array of paths to the test files.
 * @param {string} projectRoot - The root directory of the project.
 * @returns {Map<string, Set<string>>} A map where the key is the test file name and the value is a set of import dependencies.
 */
function createTestFileMappings(testPaths, projectRoot) {
  const testFileMappings = testPaths.map((testPath) => {
    const imports = new Set();
    const testName = basename(testPath);
    const tsxFilePath = join(
      dirname(testPath).replace('/e2e', ''),
      testName.replace('.e2e.ts', '.tsx')
    );
    const tsFilePath = tsxFilePath.replace('.tsx', '.ts');

    let sourceFilePath;
    if (ensureFileExists(tsxFilePath)) {
      sourceFilePath = tsxFilePath;
    } else if (ensureFileExists(tsFilePath)) {
      sourceFilePath = tsFilePath;
    } else {
      throw new Error(`File ${tsxFilePath} or ${tsFilePath} does not exist.`);
    }

    [
      relative(projectRoot, sourceFilePath),
      ...listImports(projectRoot, sourceFilePath),
      ...listImports(projectRoot, testPath),
    ].forEach((importedFile) => imports.add(importedFile));

    return [testName, imports];
  });

  return new Map(testFileMappings);
}

/**
 * Determines which test files need to be run based on the changed files and their dependencies.
 *
 * @param {string[]} changedFiles - An array of file paths that have been changed.
 * @param {Map<string, Set<string>>} testDependencies - A map where the keys are test file paths and the values are sets of source file paths that the test files depend on.
 * @returns {string} A space-separated string of test file paths that need to be run.
 */
function determineTestFilesToRun(changedFiles, testDependencies) {
  const testsToRun = new Set();
  for (const changedFile of changedFiles) {
    for (const [testFile, sourceFiles] of testDependencies) {
      ensureIsNotCoveoPackage(changedFile);
      ensureIsNotPackageJsonOrPackageLockJson(changedFile);
      const isChangedTestFile = testFile === basename(changedFile);
      const isAffectedSourceFile = sourceFiles.has(changedFile);
      if (isChangedTestFile || isAffectedSourceFile) {
        testsToRun.add(testFile);
        testDependencies.delete(testFile);
      }
    }
  }
  return [...testsToRun].join(' ');
}

/**
 * Ensures that the given file is not part of a Coveo package.
 * Throws an error if the file depends on a Coveo package.
 *
 * @param {string} file - The path to the file to check.
 * @throws {DependentPackageChangeError} If the file depends on a Coveo package.
 */
function ensureIsNotCoveoPackage(file) {
  if (dependsOnBueno(file)) {
    throw new DependentPackageChangeError(file);
  }
}

/**
 * Ensures that the provided file is not 'package.json' or 'package-lock.json'.
 * Throws a PackageJsonChangeError if the file is either of these.
 *
 * @param {string} file - The name or path of the file to check.
 * @throws {PackageJsonChangeError} If the file is 'package.json' or 'package-lock.json'.
 */
function ensureIsNotPackageJsonOrPackageLockJson(file) {
  if (file.includes('package.json') || file.includes('package-lock.json')) {
    throw new PackageJsonChangeError(file);
  }
}

function dependsOnBueno(file) {
  return file.includes(join('packages', 'bueno'));
}

/**
 * Allocates test shards based on the total number of tests and the maximum number of shards.
 *
 * @param {number} testCount - The total number of tests.
 * @param {number} maximumShards - The maximum number of shards to allocate.
 * @returns {[number[], number[]]} An array containing two elements:
 *   - The first element is an array of shard indices.
 *   - The second element is an array containing the total number of shards.
 */
function allocateShards(testCount, maximumShards) {
  const shardTotal =
    testCount === 0 ? maximumShards : Math.min(testCount, maximumShards);
  const shardIndex = Array.from({length: shardTotal}, (_, i) => i + 1);
  return [shardIndex, [shardTotal]];
}

function hasHeadlessChanges(changedFiles) {
  return changedFiles.some((file) =>
    file.includes(join('packages', 'headless'))
  );
}

const {base, head} = getBaseHeadSHAs();
let changedFiles = getChangedFiles(base, head).split(EOL);
const outputNameTestsToRun = process.argv[2];
const outputNameShardIndex = process.argv[3];
const outputNameShardTotal = process.argv[4];
const runAllTests = process.argv[5] === 'true';
const projectRoot = process.env.projectRoot;
const atomicSourceComponents = join('packages', 'atomic', 'src', 'components');

try {
  if (runAllTests) {
    throw new RunAllTestsInMergeQueueError();
  }

  const testFiles = findAllTestFiles(atomicSourceComponents);

  if (hasHeadlessChanges(changedFiles)) {
    console.log(
      'Headless file changes detected, computing affected Headless endpoints...'
    );

    const affectedHeadlessEnpoints = getAllHeadlessAffectedEndpoints(
      changedFiles,
      projectRoot
    );

    console.log('Affected Headless endpoints', affectedHeadlessEnpoints);

    changedFiles = changedFiles
      .filter((filePath) => !filePath.includes(join('packages', 'headless')))
      .concat(affectedHeadlessEnpoints);
  }

  const testDependencies = createTestFileMappings(testFiles, projectRoot);
  const testsToRun = determineTestFilesToRun(changedFiles, testDependencies);

  if (testsToRun === '') {
    throw new NoRelevantChangesError();
  }

  const maximumShards = parseInt(process.env.maximumShards, 10);
  const [shardIndex, shardTotal] = allocateShards(
    testsToRun.split(' ').length,
    maximumShards
  );

  setOutput(outputNameTestsToRun, testsToRun);
  setOutput(outputNameShardIndex, shardIndex);
  setOutput(outputNameShardTotal, shardTotal);
} catch (error) {
  if (error instanceof NoRelevantChangesError) {
    console.warn(error?.message || error);
    setOutput(outputNameTestsToRun, '');
    setOutput(outputNameShardIndex, [0]);
    setOutput(outputNameShardTotal, [0]);
  } else if (
    error instanceof DependentPackageChangeError ||
    error instanceof PackageJsonChangeError ||
    error instanceof RunAllTestsInMergeQueueError
  ) {
    console.warn(error?.message || error);
    setOutput(outputNameTestsToRun, '');
    const shardIndex = Array.from(
      {length: process.env.maximumShards},
      (_, i) => i + 1
    );
    setOutput(outputNameShardIndex, shardIndex);
    const shardTotal = [process.env.maximumShards];
    setOutput(outputNameShardTotal, shardTotal);
  } else {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}
