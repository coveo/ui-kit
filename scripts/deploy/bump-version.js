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

/**
 * @param {'pre' | 'graduate'} versionType
 * @param {boolean} [amend]
 */
async function bumpVersionAndPush(versionType, amend = false) {
  try {
    const flags = ['--yes'];
    amend && flags.push('--amend')
    await exec(`npm run version:${versionType} -- ${flags.join(' ')}`);
  } catch (e) {
    console.error(
      'Failed to bump version. Exiting to not publish local changes.',
      e
    );
    process.exit(1);
  }
}

/**
 * @returns {Record<string, boolean>}
 */
function getFlags() {
  return process.argv.reduce(
    (flags, flag) => flag.startsWith('--')
      ? {...flags, [flag.slice(2)]: true}
      : flags,
    {}
  );
}

async function main() {
  try {
    const flags = getFlags();

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

    if (flags.graduate) {
      return await bumpVersionAndPush('graduate', !!flags.amend);
    }
    if (!headCommitTag) {
      return await bumpVersionAndPush('pre', !!flags.amend);
    }

    console.log('Build commit is tagged and not being graduated. Skipping version bump.');
    return;

    
  } catch (e) {
    console.error(e);
  }
}

main();
