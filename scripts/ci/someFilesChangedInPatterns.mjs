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

function checkPatterns(files, patterns) {
  for (const pattern of patterns) {
    for (const file of files.trim().split(/\r?\n/)) {
      if (minimatch(file.trim(), pattern)) {
        return true;
      }
    }
  }
  return false;
}

const {base, head} = getBaseHeadSHAs();
const files = getChangedFiles(base, head);
const patterns = getPatterns();
const someFilesChangedInPatterns = checkPatterns(files, patterns);
const outputName = getOutputName();
setOutput(outputName, someFilesChangedInPatterns);
