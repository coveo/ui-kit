const {promisify} = require('util');
const {
  authenticateGitClient,
  getHeadCommitHash,
  checkoutLatestMaster,
  getHeadCommitTag,
} = require('./git-client');
const exec = promisify(require('child_process').exec);

async function graduateRelease() {
  try {
    await exec('npm run version:graduate -- --yes');
  } catch (e) {
    console.error(
      'Failed to graduate version. Exiting to not publish local changes.',
      e
    );
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

    await graduateRelease();
  } catch (e) {
    console.error(e);
  }
}

main();
