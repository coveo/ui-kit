#!/usr/bin/env node
import {setOutput} from '@actions/core';
import {minimatch} from 'minimatch';
import {getBaseHeadSHAs, getChangedFiles} from './git-utils.mjs';

function getOutputName() {
  return process.argv[2];
}

function getPatterns() {
  return process.argv.slice(3);
}

function everyFileMatchOnePattern(files, patterns) {
  return files
    .trim()
    .split(/\r?\n/)
    .every((file) => {
      return patterns.some((pattern) => {
        return minimatch(file.trim(), pattern);
      });
    });
}

const {base, head} = getBaseHeadSHAs();
const files = getChangedFiles(base, head);
const patterns = getPatterns();
const everyFileIncludedInPatterns = everyFileMatchOnePattern(files, patterns);
console.log(
  `Files changed between ${base} and ${head}: ${files.trim()}\nPatterns: ${patterns}\nEvery file matches one pattern: ${everyFileIncludedInPatterns}`
);
const outputName = getOutputName();
setOutput(outputName, everyFileIncludedInPatterns);
