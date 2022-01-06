const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

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
    await exec(
      `npx lerna version --conventional-commits --conventional-graduate --no-private --yes`
    );
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
      console.log(
        'Build commit is tagged and not being graduated. Skipping version bump.'
      );
      return;
    }

    await bumpVersionAndPush();
  } catch (e) {
    console.error(e);
  }
}

main();
