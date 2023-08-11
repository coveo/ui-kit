import {
  generateChangelog,
  getCommits,
  getNextVersion,
  getLastTag,
  gitCommit,
  gitPush,
  gitPushTags,
  gitTag,
  parseCommits,
  pnpmGetChangedPackages,
  pnpmBumpVersion,
  writeChangelog,
} from "@coveo/semantic-monorepo-tools";
import angularChangelogConvention from "conventional-changelog-angular";
import { exec as syncExec } from "child_process";
import { dedent } from "ts-dedent";
import { promisify } from "util";

const PATH = ".";
const REPO_OWNER = "coveo";
const REPO_NAME = "relay";

const convention = await angularChangelogConvention;
const packages = [
  { name: "playground", path: `${PATH}/apps/playground` },
  { name: "@coveo/relay", path: `${PATH}/packages/relay` },
];

export const isNewVersionGreaterThanCurrentVersion = ({
  currentVersion,
  newVersion,
}) => {
  const current = parseVersion(currentVersion);
  const newV = parseVersion(newVersion);

  return isNewGreaterThanCurrent({ newV, current, i: 0 });
};

const parseVersion = (version) => {
  return version.split(".").map((num) => parseInt(num, 10));
};

const isNewGreaterThanCurrent = ({ newV, current, i }) => {
  if (i > newV.length) {
    return false;
  }

  if (newV[i] === current[i]) {
    return isNewGreaterThanCurrent({
      newV,
      current,
      i: i + 1,
    });
  }

  return newV[i] > current[i];
};

const hasChangesOccured = async () => {
  const exec = promisify(syncExec);
  try {
    const { stdout, stderr } = await exec("git status");

    if (typeof stderr != "string") {
      console.error(stderr);
      return false;
    }

    if (stdout.includes("nothing to commit")) return false;

    return true;
  } catch (e) {
    console.error(e);
  }
};

const getVersionPrefix = (name) => `${name}/v`;

const updateChangelog = async ({
  parsedCommits,
  newVersion,
  newVersionTag,
  lastTag,
  path,
}) => {
  const changelog = await generateChangelog(
    parsedCommits,
    newVersion,
    {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      host: "https://github.com",
      linkReferences: true,
      currentTag: newVersionTag,
      previousTag: lastTag,
    },
    convention.writerOpts
  );
  await writeChangelog(path, changelog);
};

const bumpVersion = async ({ newVersion, name, lastTag }) => {
  console.info(`\x1b[32m Bumping ${name} to version ${newVersion} \n`);

  const excludedPackages = packages
    .filter((pkg) => pkg.name != name)
    .map((pkg) => pkg.name);

  await pnpmBumpVersion(newVersion, lastTag, [name], excludedPackages);
};

const runPackageBump = async (pkg) => {
  const { name, path } = pkg;
  const versionPrefix = getVersionPrefix(name);
  const lastTag = await getLastTag(versionPrefix);
  console.info(`\x1b[35m last tag of ${name}: ${lastTag} \n`);

  const changedPackages = await pnpmGetChangedPackages(lastTag);
  if (!changedPackages.includes(name)) {
    console.info(
      `\x1b[33m No files changed, skipping version bump for ${name} \n`
    );
    return;
  }

  const commits = await getCommits(PATH, lastTag);
  const parsedCommits = parseCommits(commits, convention.parserOpts);

  const bumpInfo = convention.recommendedBumpOpts.whatBump(parsedCommits);

  const currentVersion = lastTag.replace(versionPrefix, "");
  const newVersion = getNextVersion(currentVersion, bumpInfo);
  const newVersionTag = `${versionPrefix}${newVersion}`;

  if (isNewVersionGreaterThanCurrentVersion({newVersion, currentVersion})) {
    await bumpVersion({ newVersion, name, lastTag });
    await gitTag(newVersionTag);
    await updateChangelog({
      parsedCommits,
      newVersion,
      newVersionTag,
      lastTag,
      path,
    });
  }
};

const commitAndPush = async () => {
  if (hasChangesOccured()) {
    const commitMessage = dedent`
    [version bump][skip ci] chore(release): relay publish

    **/CHANGELOG.md
    **/package.json
    package.json
    pnpm-lock.yaml
    `;

    await gitCommit(commitMessage, ".");
    await gitPush();
    await gitPushTags();
  }
};

const bumpVersions = async () => {
  try {
    await Promise.all(packages.map(async (pkg) => await runPackageBump(pkg)));

    await commitAndPush();
  } catch (e) {
    console.error(e);
  }
};

bumpVersions();
