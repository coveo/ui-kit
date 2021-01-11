const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

async function authenticateGitClient() {
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

async function bumpVersionAndPush(versionType) {
  try {
    await exec(`npm run version:${versionType} -- --yes`);
  } catch (e) {
    console.error(
      'Failed to bump version. Exiting to not publish local changes.',
      e
    );
    process.exit(1);
  }
}

async function main() {
  try {
    const doGraduate = process.argv[2] === '--graduate';
    await authenticateGitClient();

    const buildCommitHash = await getHeadCommitHash();
    await checkoutLatestMaster();
    const masterCommitHash = await getHeadCommitHash();

    if (buildCommitHash !== masterCommitHash) {
      console.log(
        'Build commit does not match latest master commit. Skipping version bump.'
      );
      return;
    }

    const headCommitTag = await getHeadCommitTag();

    if (headCommitTag) {
      console.log('Build commit is tagged. Skipping version bump.');
      return;
    }

    await bumpVersionAndPush(doGraduate ? 'graduate' : 'pre');
  } catch (e) {
    console.error(e);
  }
}

main();
