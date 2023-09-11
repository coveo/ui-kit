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
import { dedent } from "ts-dedent";
import { promisify } from "util";
import { exec as cbExec } from "child_process";

const PATH = ".";
const REPO_OWNER = "coveo";
const REPO_NAME = "relay";

const convention = await angularChangelogConvention;
const packages = [
  { name: "playground", path: `${PATH}/apps/playground` },
  { name: "@coveo/relay", path: `${PATH}/packages/relay` },
];

/**
 * @todo LENS-1125: versionCompare, parseVersion and recursiveVersionCompare functions could be part to a Core helpers file
 * The versionCompare function should be imported in the script instead
 */

const versionCompare = (version1, version2) => {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);

  return recursiveVersionCompare(v1, v2, 0);
};

const parseVersion = (version) => {
  return version.split(".").map((num) => parseInt(num, 10));
};

const recursiveVersionCompare = (version1, version2, i) => {
  if (i > version1.length) {
    return 0;
  }

  if (version1[i] === version2[i]) {
    return recursiveVersionCompare(version1, version2, i + 1);
  }

  return version1[i] > version2[i] ? 1 : -1;
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

  const packagesExceptCurrent = packages
    .filter((pkg) => pkg.name != name)
    .map((pkg) => pkg.name);

  const excludedPackages = [
    "eslint-config-custom",
    "tsconfig",
    ...packagesExceptCurrent,
  ];

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

  if (versionCompare(newVersion, currentVersion) >= 1) {
    await bumpVersion({ newVersion, name, lastTag });
    await updateChangelog({
      parsedCommits,
      newVersion,
      newVersionTag,
      lastTag,
      path,
    });

    return newVersionTag;
  }
};

const format = async () => {
  const exec = promisify(cbExec);
  await exec("pnpm format");
};

const commitAndPush = async (tags) => {
  const commitMessage = dedent`
    [version bump] chore(release): relay publish

    **/CHANGELOG.md
    **/package.json
    package.json
    pnpm-lock.yaml
    `;

  await gitCommit(commitMessage, ".");

  for (const tag of tags) {
    await gitTag(tag);
  }

  await gitPush();
  await gitPushTags();
};

const bumpVersions = async () => {
  try {
    const rawTags = await Promise.all(
      packages.map(async (pkg) => await runPackageBump(pkg))
    );
    const tags = rawTags.filter((tag) => !!tag);

    if (!tags.length) {
      return;
    }

    await format();
    await commitAndPush(tags);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

bumpVersions();
