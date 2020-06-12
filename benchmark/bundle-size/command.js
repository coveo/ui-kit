const { resolve } = require('path');
const { readFileSync } = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function computeFileSizes() {
  await setup();
  await buildFiles();
  return readFileSizes();
}

async function setup() {
  console.log('setting up repositories');
  await exec('npm run setup');
}

async function buildFiles() {
  console.log('building files');
  await exec('npm run build');
}

function readFileSizes() {
  console.log('getting file sizes');
  const path = resolve('packages/headless/.size-snapshot.json')
  const buffer = readFileSync(path)
  return JSON.parse(buffer.toString());
}

module.exports = { computeFileSizes }
