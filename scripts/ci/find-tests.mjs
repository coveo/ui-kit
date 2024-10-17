#!/usr/bin/env node
import {setOutput} from '@actions/core';
import {readdirSync, statSync} from 'fs';
import {EOL} from 'os';
import {basename, dirname, join, relative} from 'path';
import {
  getBaseHeadSHAs,
  getChangedFiles,
  getOutputName,
} from './hasFileChanged.mjs';
import {listImports, ensureFileExists} from './list-imports.mjs';

/**
 * Recursively searches for all end-to-end (E2E) test files in a given directory.
 * E2E test files are identified by the `.e2e.ts` file extension.
 *
 * @param dir - The root directory to start the search from.
 * @returns An array of strings, each representing the full path to an E2E test file.
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
 * Creates a mapping of test file names to the set of files they import.
 *
 * @param testPaths - An array of E2E test file paths.
 * @returns A map where each key is a test file name and the value is the set of files it imports.
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
 * Determines which E2E test files to run based on the files that have changed.
 *
 * @param changedFiles - An array of files that have changed.
 * @param testDependencies - A map of test file names to the set of files they import.
 * @returns A space-separated string of test files to run.
 */
function determineTestFilesToRun(changedFiles, testDependencies) {
  const testsToRun = new Set();
  for (const changedFile of changedFiles) {
    console.log('changedFile:', changedFile);
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

function ensureIsNotCoveoPackage(file) {
  if (dependsOnCoveoPackage(file)) {
    throw new Error('Change detected in an different Coveo package.', file);
  }
}

function dependsOnCoveoPackage(file) {
  const externalPackages = ['packages/headless', 'packages/bueno'];
  for (const pkg of externalPackages) {
    if (file.includes(pkg)) {
      return true;
    }
  }
}

const {base, head} = getBaseHeadSHAs();
const changedFiles = getChangedFiles(base, head).split(EOL);
const outputName = getOutputName();
const projectRoot = process.env.projectRoot;
const atomicSourceComponents = join('packages', 'atomic', 'src', 'components');

try {
  const testFiles = findAllTestFiles(atomicSourceComponents);
  const testDependencies = createTestFileMappings(testFiles, projectRoot);
  const testsToRun = determineTestFilesToRun(changedFiles, testDependencies);
  console.log('testsToRun:', testsToRun);
  setOutput(
    outputName,
    testsToRun !== undefined ? testsToRun : '--grep @no-test'
  );

  if (!testsToRun) {
    console.log('No relevant source file changes detected for E2E tests.');
  }
} catch (error) {
  console.warn(error?.message || error);
}
