const {promisify} = require('util');
const {buildReport} = require('./report');
const {computeFileSizes} = require('./command');
const {getHeadBranchName, getBaseBranchName} = require('../github-client');
const exec = promisify(require('child_process').exec);

async function deleteNodeModules() {
  console.log('deleting node_modules');
  await exec('rm -rf packages/headless/node_modules');
}

async function discardChanges() {
  console.log('discarding changes');
  await exec('git checkout -- .');
}

async function checkoutTargetBranch() {
  const targetBranch = await getBaseBranchName();
  console.log(`checking out branch: ${targetBranch}`);
  await exec(`git checkout ${targetBranch}`);
}

async function buildBundleSizeReport() {
  const sourceBranch = await getHeadBranchName();
  console.log(`on branch: ${sourceBranch}`);
  const newSizes = await computeFileSizes();

  await deleteNodeModules();
  await discardChanges();
  await checkoutTargetBranch();

  const oldSizes = await computeFileSizes();

  return buildReport(oldSizes, newSizes);
}

module.exports = {buildBundleSizeReport};
