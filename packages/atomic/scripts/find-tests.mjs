#!/usr/bin/env node
import {setOutput} from '@actions/core';
import 'fs';
import {readdirSync, statSync} from 'fs';
import 'path';
import {basename, resolve, dirname, join} from 'path';
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
  const testFiles = [];

  function searchFiles(currentDir) {
    const files = readdirSync(currentDir);

    for (const file of files) {
      const fullPath = join(currentDir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        searchFiles(fullPath);
      } else if (fullPath.endsWith('.e2e.ts')) {
        testFiles.push(fullPath);
      }
    }
  }

  searchFiles(dir);
  return testFiles;
}

/**
 * Creates a mapping of test file names to the set of files they import.
 *
 * @param testFiles - An array of E2E test file paths.
 * @returns A map where each key is a test file name and the value is a set of files it imports.
 */
function createTestFileMappings(testFiles) {
  const testFileMappings = testFiles.map((file) => {
    const fileName = basename(file);
    const sourceFile = join(
      dirname(file).replace('/e2e', ''),
      fileName.replace('.e2e.ts', '.tsx')
    );

    ensureFileExists(sourceFile);
    const imports = new Set();
    [resolve(sourceFile), ...listImports(sourceFile)].forEach((importedFile) =>
      imports.add(importedFile)
    );

    console.log('*********************');
    console.log(fileName, [...imports]);
    console.log('*********************');

    return [fileName, imports];
  });

  return new Map(testFileMappings);
}

function determineTestFilesToRun(filesChanged, testMappings) {
  const testsToRun = new Set();
  for (const file of filesChanged) {
    for (const [testFile, sourceFiles] of testMappings) {
      if (dependsOnCoveoPackage(file)) {
        console.log('Change detected in a Coveo package.');
        return;
      }
      if (sourceFiles.has(file)) {
        testsToRun.add(testFile);
        break;
      }
    }
  }
  return [...testsToRun].join(' ');
}

function dependsOnCoveoPackage(file) {
  return file.includes('@coveo');
}

const {base, head} = getBaseHeadSHAs();
const changedFiles = getChangedFiles(base, head);

const outputName = getOutputName();
const testFiles = findAllTestFiles(join('src', 'components')); // TODO: maybe should be an input
const testMappings = createTestFileMappings(testFiles);

// TODO: check what happens to the output if an error is thrown
const testsToRun = determineTestFilesToRun(changedFiles, testMappings);
if (testsToRun) {
  setOutput(outputName, testsToRun);
} else {
  console.log('Running all tests');
}
setOutput(outputName, testsToRun);
