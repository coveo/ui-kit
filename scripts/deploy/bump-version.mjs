import {
  isOnReleaseBranch,
  getHowManyCommitsBehindUpstream,
  getHeadCommitTag,
} from '../git.mjs';
import {bumpPrereleaseVersionAndPush} from '../prerelease.mjs';
import {bumpReleaseVersionAndPush} from '../release.mjs';

async function bumpVersionAndPush() {
  try {
    (await isOnReleaseBranch())
      ? await bumpReleaseVersionAndPush()
      : await bumpPrereleaseVersionAndPush();
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
    if ((await getHowManyCommitsBehindUpstream()) !== 0) {
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
