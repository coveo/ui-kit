const { promisify } = require('util');
const { buildReport, sendReport } = require('./report');
const { computeFileSizes } = require('./command');
const exec = promisify(require('child_process').exec);

const sourceBranch = process.env.BITBUCKET_SOURCE_BRANCH || 'unknown';
const targetBranch = process.env.BITBUCKET_TARGET_BRANCH || 'master';

async function deleteNodeModules() {
  console.log('deleting node_modules');
  await exec('rm -rf packages/headless/node_modules');
}

async function discardChanges() {
  console.log('discarding changes');
  await exec('git checkout -- .');
}

async function checkoutTargetBranch() {
  console.log(`checking out branch: ${targetBranch}`);
  await exec(`git checkout ${targetBranch}`);
}

async function main() {
  console.log(`on branch: ${sourceBranch}`);
  const newSizes = await computeFileSizes();

  await deleteNodeModules();
  await discardChanges();
  await checkoutTargetBranch();

  const oldSizes = await computeFileSizes();

  const report = buildReport(oldSizes, newSizes);
  sendReport(report);
}

main();
