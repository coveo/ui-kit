const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

function authenticateGitClient() {
  const credentials = process.env.BB_CREDENTIALS || '';
  
  if (!credentials) {
    return console.log('No bitbucket credentials found. Skipping git client authentication.');
  }

  return exec(`git remote set-url origin https://${credentials}@bitbucket.org/coveord/ui-kit.git`)
}

async function getHeadCommitHash() {
  const {stdout} = await exec('git rev-parse HEAD');
  return stdout;
}

async function getHeadCommitTag() {
  const {stdout} = await exec('git tag --points-at HEAD');
  return stdout;
}

async function checkoutLatestMaster() {
  await exec('git checkout master');
  await exec('git pull origin master');
}

async function bumpVersionAndPush() {
  try {
    await exec('npm run version:pre -- --yes');
  } catch(e) {
    console.error('Failed to bump version. Exiting to not publish local changes.', e);
    process.exit(1);
  }
}

async function main() {
  try {
    await authenticateGitClient();
  
    const buildCommitHash = await getHeadCommitHash();
    await checkoutLatestMaster();
    const masterCommitHash = await getHeadCommitHash();
  
    if (buildCommitHash !== masterCommitHash) {
      console.log('Build commit does not match latest master commit. Skipping version bump.')
      return;
    }

    const headCommitTag = await getHeadCommitTag();
    
    if (headCommitTag) {
      console.log('Build commit is tagged. Skipping version bump.')
      return;
    }
  
    await bumpVersionAndPush();
  } catch(e) {
    console.error(e);
  }
}

main();