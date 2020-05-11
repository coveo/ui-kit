const { resolve } = require('path');
const { readFileSync } = require('fs');
const { promisify } = require('util');
const { buildReport, sendReport } = require('./report');
const exec = promisify(require('child_process').exec);

const targetBranch = process.env.BITBUCKET_TARGET_BRANCH || 'master';

async function installDependencies() {
  console.log('installing dependencies');
  await exec('npm i');
}

async function buildFiles() {
  console.log('building files');
  await exec('npm run build');
}

async function readFileSizes() {
  console.log('getting file sizes', __dirname);
  const path = resolve('.size-snapshot.json')
  const buffer = await readFileSync(path)
  return JSON.parse(buffer.toString());
}

async function discardChanges() {
  console.log('discarding changes');
  await exec('git checkout -- .');
}

async function checkoutTargetBranch() {
  console.log(`checking out branch: ${targetBranch}`);
  await exec(`git checkout ${targetBranch}`);
}

async function computeFileSizes() {
  await installDependencies();
  await buildFiles();
  return await readFileSizes();
}

async function main() {
  const newSizes = await computeFileSizes();

  await discardChanges();
  await checkoutTargetBranch();

  const oldSizes = await computeFileSizes();

  const report = buildReport(oldSizes, newSizes);
  sendReport(report);
}

main();
