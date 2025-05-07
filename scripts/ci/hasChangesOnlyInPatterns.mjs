#!/usr/bin/env node
import {setOutput} from '@actions/core';
import {context} from '@actions/github';
import {minimatch} from 'minimatch';
import {execSync} from 'node:child_process';

export function getBaseHeadSHAs() {
  switch (context.eventName) {
    case 'pull_request':
      return {
        base: context.payload.pull_request.base.sha,
        head: context.payload.pull_request.head.sha,
      };
    case 'merge_group':
      return {
        base: context.payload.merge_group.base_sha,
        head: context.payload.merge_group.head_sha,
      };
  }
}

export function getChangedFiles(from, to) {
  return execSync(`git diff --name-only ${from}..${to}`, {
    stdio: 'pipe',
    encoding: 'utf-8',
  });
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

function getOutputName() {
  return process.argv[2];
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
