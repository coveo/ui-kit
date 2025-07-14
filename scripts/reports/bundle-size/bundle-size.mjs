import {execute} from '../../exec.mjs';
import {getBaseBranchName, getHeadBranchName} from '../github-client.mjs';
import {computeFileSizes} from './command.mjs';
import {buildReport} from './report.mjs';

async function deleteNodeModules() {
  console.log('deleting node_modules');
  await execute('git', ['clean', '-fdx']);
}

async function discardChanges() {
  console.log('discarding changes');
  await execute('git', ['checkout', '--', '.']);
}

async function checkoutTargetBranch() {
  const targetBranch = await getBaseBranchName();
  console.log(`checking out branch: ${targetBranch}`);
  await execute('git', ['checkout', targetBranch]);
}

export async function buildBundleSizeReport() {
  const sourceBranch = await getHeadBranchName();
  console.log(`on branch: ${sourceBranch}`);
  const newSizes = await computeFileSizes();

  await deleteNodeModules();
  await discardChanges();
  await checkoutTargetBranch();

  const oldSizes = await computeFileSizes();

  return buildReport(oldSizes, newSizes);
}
