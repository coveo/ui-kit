#!/usr/bin/env node
import {setOutput} from '@actions/core';

function getOutputName() {
  return process.argv.slice(2, 4);
}

function allocateShards(testCount, maximumShards) {
  const shardTotal =
    testCount === 0 ? maximumShards : Math.min(testCount, maximumShards);
  const shardIndex = Array.from({length: shardTotal}, (_, i) => i + 1);
  return [shardIndex, [shardTotal]];
}

const testsToRun = process.env.testsToRun.split(' ');
const maximumShards = parseInt(process.env.maximumShards, 10);

const [shardIndexOutputName, shardTotalOutputName] = getOutputName();
const [shardIndex, shardTotal] = allocateShards(
  testsToRun.length,
  maximumShards
);

setOutput(shardIndexOutputName, shardIndex);
setOutput(shardTotalOutputName, shardTotal);
