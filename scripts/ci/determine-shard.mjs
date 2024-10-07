#!/usr/bin/env node
import {setOutput, getInput} from '@actions/core';

function getOutputName() {
  return process.argv.slice(2, 4);
}

function allocateShards(testCount, maximumShards) {
  const shardsPerTestSuite = 2;
  const shardTotal =
    testCount === 0
      ? maximumShards
      : Math.min(testCount * shardsPerTestSuite, maximumShards);

  const shardIndex = Array.from({length: shardTotal}, (_, i) => i + 1);
  return [shardIndex, [shardTotal]];
}

const testsToRun = getInput('testsToRun').split(' ');
const maximumShards = parseInt(getInput('maximumShards'), 10);

const [shardIndexOutputName, shardTotalOutputName] = getOutputName();
const [shardIndex, shardTotal] = allocateShards(
  testsToRun.length,
  maximumShards
);

console.log('*********************');
console.log(shardIndexOutputName, shardTotalOutputName);
console.log(shardIndex, shardTotal);
console.log('*********************');

setOutput(shardIndexOutputName, shardIndex);
setOutput(shardTotalOutputName, shardTotal);
