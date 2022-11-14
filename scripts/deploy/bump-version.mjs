import {promisify} from 'util';
import {execute} from '../exec.mjs';
import {
  isOnReleaseBranch,
  getHowManyCommitsBehind,
  getHeadCommitTag,
} from '../git.mjs';

async function bumpVersionAndPush() {
  try {
    const flags = [
      '--no-install',
      'lerna',
      'version',
      '--conventional-commits',
      (await isOnReleaseBranch())
        ? '--conventional-graduate'
        : '--conventional-prerelease',
      '--no-private',
      '--yes',
      '--exact',
    ];
    await execute(`npx`, flags);
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
    if ((await getHowManyCommitsBehind()) !== 0) {
      console.log(
        'Build commit does not match latest commit. Skipping version bump.'
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
