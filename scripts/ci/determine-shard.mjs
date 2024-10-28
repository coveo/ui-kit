#!/usr/bin/env node
import {setOutput} from '@actions/core';

function getOutputName() {
  return process.argv.slice(2, 4);
}

function allocateShards(testCount, maximumShards) {
  const shardTotal =
    testCount === 0 ? maximumShards : Math.min(testCount, maximumShards);
  console.log('shardTotal:', shardTotal);
  const shardIndex = Array.from({length: shardTotal}, (_, i) => i + 1);
  console.log('shardIndex:', shardIndex);
  return [shardIndex, [shardTotal]];
}

const testsToRun = process.env.testsToRun.split(' ');
console.log('testsToRun:', testsToRun);
const maximumShards = parseInt(process.env.maximumShards, 10);
console.log('maximumShards:', maximumShards);

const [shardIndexOutputName, shardTotalOutputName] = getOutputName();
console.log('shardIndexOutputName:', shardIndexOutputName);
const [shardIndex, shardTotal] = allocateShards(
  testsToRun.length,
  maximumShards
);
console.log('shardIndex:', shardIndex);
console.log('shardTotal:', shardTotal);

setOutput(shardIndexOutputName, shardIndex);
setOutput(shardTotalOutputName, shardTotal);

/**
 * in the case of headless changing
 *
 * we get 0 tests to run, instead we should get them all ? Do I need a certain hard coded value ?
 *
 */

/**
 * in the case of quantic changing
 *
 * we get 0 tests to run but we should not run them at all
 */
