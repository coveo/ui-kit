#!/usr/bin/env node
import {setOutput} from '@actions/core';
import {readdirSync, statSync} from 'fs';
import {EOL} from 'os';
import {basename, dirname, join, relative} from 'path';
import {getBaseHeadSHAs, getChangedFiles} from './hasFileChanged.mjs';
import {listImports, ensureFileExists} from './list-imports.mjs';

class NoRelevantChangesError extends Error {
  constructor() {
    super('Change detected elsewhere, running no tests.');
    this.name = 'NoRelevantChangesError';
  }
}

class DependentPackageChangeError extends Error {
  constructor(file) {
    super(
      `Change detected in an atomic dependent Coveo package: ${file}. Running all tests.`
    );
    this.name = 'DependentPackageChangeError';
    this.file = file;
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
    const sourceFilePath = join(
      dirname(testPath).replace('/e2e', ''),
      testName.replace('.e2e.ts', '.tsx')
    );

    ensureFileExists(sourceFilePath);

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
 * @throws {Error} If the file depends on a Coveo package.
 */
function ensureIsNotCoveoPackage(file) {
  if (dependsOnCoveoPackage(file)) {
    throw new DependentPackageChangeError(file);
  }
}

/**
 * Checks if a given file depends on any of the specified external Coveo packages.
 *
 * @param {string} file - The path of the file to check.
 * @returns {boolean} - Returns true if the file path includes any of the external package paths, otherwise false.
 */
function dependsOnCoveoPackage(file) {
  const externalPackages = ['packages/headless/', 'packages/bueno/'];
  for (const pkg of externalPackages) {
    if (file.includes(pkg)) {
      return true;
    }
  }
}

/**
 * Allocates test shards based on the number of tests to run and the maximum number of shards.
 *
 * @param {string} testToRun - A string containing the tests to run, separated by spaces.
 * @param {number} maximumShards - The maximum number of shards that can be allocated.
 * @returns {Array} An array containing two arrays:
 *   - The first array contains the indices of the allocated shards.
 *   - The second array contains the total number of allocated shards.
 */
function allocateShards(testToRun, maximumShards) {
  const testCount = testToRun.split(' ');
  const shardTotal =
    testCount === 0 ? maximumShards : Math.min(testCount, maximumShards);
  const shardIndex = Array.from({length: shardTotal}, (_, i) => i + 1);
  return [shardIndex, [shardTotal]];
}

const {base, head} = getBaseHeadSHAs();
const changedFiles = getChangedFiles(base, head).split(EOL);
const outputNameTestsToRun = process.argv[2];
const outputNameShardIndex = process.argv[3];
const outputNameShardTotal = process.argv[4];
const projectRoot = process.env.projectRoot;
const atomicSourceComponents = join('packages', 'atomic', 'src', 'components');

try {
  const testFiles = findAllTestFiles(atomicSourceComponents);
  const testDependencies = createTestFileMappings(testFiles, projectRoot);
  const testsToRun = determineTestFilesToRun(changedFiles, testDependencies);
  if (testsToRun === '') {
    throw new NoRelevantChangesError();
  }
  const {shardIndex, shardTotal} = allocateShards(
    testsToRun,
    process.env.maximumShards
  );
  console.log('Running tests for the following files:', testsToRun);
  setOutput(outputNameTestsToRun, testsToRun);
  console.log('testsToRun:', testsToRun);
  setOutput(outputNameShardIndex, shardIndex);
  console.log('shardIndex:', shardIndex);
  setOutput(outputNameShardTotal, shardTotal);
  console.log('shardTotal:', shardTotal);
  //TODO : Add logging for each particular case, quantic, subset of atomic, and dependant package.
  // TO achieve this, throw the two error and catch them below, one where testsToRun is empty, and the other where a dependant package is detected.
} catch (error) {
  if (error instanceof NoRelevantChangesError) {
    console.warn(error?.message || error);
    setOutput(outputNameTestsToRun, '');
    // should those be arrays ???
    setOutput(outputNameShardIndex, [0]);
    setOutput(outputNameShardTotal, [0]);
  }

  if (error instanceof DependentPackageChangeError) {
    console.warn(error?.message || error);
    setOutput(outputNameTestsToRun, '');
    const shardIndex = Array.from(
      {length: process.env.maximumShards},
      (_, i) => i + 1
    );
    const shardTotal = [process.env.maximumShards];
    setOutput(outputNameShardIndex, shardIndex);
    console.log('shardIndex:', shardIndex);
    setOutput(outputNameShardTotal, shardTotal);
    console.log('shardTotal:', shardTotal);
  }
}
