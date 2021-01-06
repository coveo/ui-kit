const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

export async function authenticateGitClient() {
  const credentials = process.env.GH_CREDENTIALS || '';

  if (!credentials) {
    return console.log(
      'No github credentials found. Skipping git client authentication.'
    );
  }

  await exec(
    `git remote set-url origin https://${credentials}@github.com/coveo/ui-kit.git`
  );
  await exec('git config --global user.email "jenkins-bot@coveo.com"');
  await exec('git config --global user.name "Jenkins Bot"');
}

export async function getHeadCommitHash() {
  const {stdout} = await exec('git rev-parse HEAD');
  return stdout;
}

export async function getHeadCommitTag() {
  const {stdout} = await exec('git tag --points-at HEAD');
  return stdout;
}

export async function checkoutLatestMaster() {
  await exec('git checkout master');
  await exec('git pull origin master');
}

export async function createBranch(branchName) {
  await exec(`git checkout -b ${branchName}`)
}
