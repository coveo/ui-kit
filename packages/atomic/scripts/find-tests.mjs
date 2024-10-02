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
// TODO: there is already a file in the root dir
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
 * @returns A map where each key is a test file name and the value is a set of files it imports.
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
      ...listImports(sourceFilePath, projectRoot),
    ].forEach((importedFile) => imports.add(importedFile));

    console.log('*********************');
    console.log(testName, [...imports]);
    console.log('*********************');

    return [testName, imports];
  });

  return new Map(testFileMappings);
}

/**
 * Determines which E2E test files to run based on the files that have changed.
 *
 * @param filesChanged - An array of files that have changed.
 * @param testMappings - A map of test file names to the set of files they import.
 * @returns A space-separated string of test files to run.
 */
function determineTestFilesToRun(filesChanged, testMappings) {
  const testsToRun = new Set();
  // TODO: make it more performant and reduce the
  for (const file of filesChanged) {
    for (const [testFile, sourceFiles] of testMappings) {
      if (dependsOnCoveoPackage(file)) {
        throw new Error('Change detected in a Coveo package.');
      }
      if (testFile.includes('atomic-commerce-pager')) {
        console.log('');
        console.log('changed file:' + file + ':');
        console.log(sourceFiles.values());
        console.log(new Set(sourceFiles).has(file));
      }
      if (sourceFiles.has(file)) {
        console.log('Adding testFile', testFile);
        testsToRun.add(testFile);
        testMappings.delete(testFile);
        break;
      }
    }
  }
  return [...testsToRun].join(' ');
}

function dependsOnCoveoPackage(file) {
  return file.includes('@coveo');
}

function getShardLevel(testCount) {}

const {base, head} = getBaseHeadSHAs();
const changedFiles = getChangedFiles(base, head).split(EOL);
console.log('******** changed files *************');
console.log(changedFiles);
console.log('*********************');

const outputName = getOutputName();
const projectRoot = '/home/runner/work/ui-kit/ui-kit'; // TODO: make this dynamic (and/or pass it as an input)
try {
  const testFiles = findAllTestFiles(
    join('src', 'components') // TODO: depends from where the script is running
  ); // TODO: maybe should be an input
  const testMappings = createTestFileMappings(testFiles, projectRoot);

  // TODO: check what happens to the output if an error is thrown
  const testsToRun = determineTestFilesToRun(changedFiles, testMappings);
  if (testsToRun) {
    console.log(testsToRun);
    setOutput(outputName, testsToRun);
  } else {
    console.log('No E2E tests to run');
  }
} catch (error) {
  console.log(error);
  console.log('Running all tests');
}
