const {promisify} = require('util');
const {readFileSync} = require('fs');
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

/**
 * @returns {Promise<string[]>}
 */
async function getPackagesToBump() {
  const {stdout} = await exec('git ls-files | grep -e "/package.json$"');
  const packages = stdout.trim().split('\n').map(filePath => JSON.parse(readFileSync(filePath).toString()));
  return packages.filter((npmPackage) => npmPackage.version && !npmPackage.private).map(({name}) => name)
}

async function bumpVersionAndPush() {
  try {
    await exec(
      `npx lerna version --conventional-commits --conventional-graduate=${(await getPackagesToBump()).join(',')} --yes`
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
