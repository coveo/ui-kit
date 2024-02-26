import * as fs from 'fs';
import * as path from 'path';
import * as pack from '../../package.json';
import * as sfdxProject from '../../sfdx-project.json';
import {createDiscussion, getRepoCategoryData} from './util/github';
import {StepLogger, StepsRunner} from './util/log';
import * as sfdx from './util/sfdx-commands';
import {
  authorizeOrg,
  SfdxJWTAuth,
  SfdxCreatePackageVersionResponse,
} from './util/sfdx-commands';

require('dotenv').config();

interface Options {
  packageId: string;
  promote: boolean;
  removeTranslations: boolean;
  jwt: SfdxJWTAuth;
  packageVersion?: string;
}

function ensureEnvVariables() {
  [
    'SFDX_AUTH_CLIENT_ID',
    'SFDX_AUTH_JWT_KEY_FILE',
    'SFDX_AUTH_JWT_USERNAME',
  ].forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`The environment variable ${v} must be defined.`);
    }
  });
}

async function getMatchingPackageVersion(versionNumber: string) {
  return (await sfdx.getPackageVersionList(30)).result.find(
    (pkg) =>
      pkg.Version === versionNumber ||
      pkg.Version.slice(0, -2) === versionNumber
  );
}

async function getIsPublished(): Promise<boolean> {
  const matchingVersion = await getMatchingPackageVersion(pack.version);
  return matchingVersion?.IsReleased;
}

async function getPackageVersion(log: StepLogger): Promise<string> {
  log('Determining next package version...');
  try {
    const versionNumber = pack.version;
    const matchingVersion = await getMatchingPackageVersion(pack.version);
    const buildNumber = matchingVersion
      ? Number(matchingVersion.Version.split('.').pop()) + 1
      : 0;
    const version = `${versionNumber}.${buildNumber}`;
    log(`Package version ${version} determined.`);
    return version;
  } catch (error) {
    log('Failed to determine next package version.');
    throw new Error(error.message);
  }
}

async function buildOptions(): Promise<Options> {
  const ci = process.argv.includes('--ci');
  const promote = process.argv.includes('--promote');
  const removeTranslations = process.argv.includes('--remove-translations');

  if (ci) {
    ensureEnvVariables();
  }

  return {
    packageId: sfdxProject.packageAliases.Quantic,
    promote: promote,
    removeTranslations: removeTranslations,
    jwt: {
      clientId: process.env.SFDX_AUTH_CLIENT_ID,
      keyFile: process.env.SFDX_AUTH_JWT_KEY_FILE,
      username: process.env.SFDX_AUTH_JWT_USERNAME,
    },
  };
}

async function authorizePublishingOrg(log: StepLogger, options: Options) {
  log(`Authorizing user: ${options.jwt.username}`);
  await authorizeOrg({
    username: options.jwt.username,
    isScratchOrg: false,
    jwtClientId: options.jwt.clientId,
    jwtKeyFile: options.jwt.keyFile,
  });
  log('Authorization successful');
}

async function ensurePackageNotPublished(log: StepLogger, options: Options) {
  log(
    `Ensuring package version ${options.packageVersion} is not already published...`
  );
  if (options.promote && (await getIsPublished())) {
    log(
      `Skipped publishing ${options.packageVersion} since this patch version is already published.`
    );
    throw new Error('Package already published.');
  }
  log('Confirmed.');
}

async function removeTranslations(log: StepLogger) {
  const translationDir = path.resolve('force-app/main/translations/');
  await fs.promises
    .readdir(translationDir)
    .then((f) =>
      Promise.all(
        f.map((e) => fs.promises.unlink(path.resolve(translationDir, e)))
      )
    );
  log('Removed translation files');
}

async function createPackage(
  log: StepLogger,
  options: Options
): Promise<SfdxCreatePackageVersionResponse> {
  log(`Creating Quantic package version ${options.packageVersion}...`);

  const response = await sfdx.createPackageVersion({
    packageId: options.packageId,
    packageVersion: options.packageVersion,
    timeout: 30,
  });

  log('Quantic package created.');
  return response;
}

async function promotePackage(log: StepLogger, packageVersionId: string) {
  log(`Promoting Quantic package ${packageVersionId} to released status...`);

  await sfdx.promotePackageVersion({
    packageVersionId,
  });
  log(`Quantic package ${packageVersionId} published.`);
}

async function createGithubDiscussionPost(
  log: StepLogger,
  options: Options,
  packageVersionId: string
) {
  const token = process.env.GITHUB_TOKEN || '';
  const packageDetails = (await sfdx.getPackageVersionList(0)).result.find(
    (pack) => pack.SubscriberPackageVersionId === packageVersionId
  );
  const discussionTitle = `${packageDetails.Package2Name} v${options.packageVersion}`;
  const discussionBody = `Package ID: ${packageDetails.SubscriberPackageVersionId}\nInstallation URL: ${packageDetails.InstallUrl}`;

  log('Creating Github discussion...');
  try {
    const repository = await getRepoCategoryData(
      {owner: 'coveo', name: 'ui-kit'},
      token
    );
    const announcementCategoryId = repository.discussionCategories.edges.find(
      (edge) => edge.node.name === 'Announcements'
    ).node.id;

    const discussion = await createDiscussion(
      {
        repositoryId: repository.id,
        categoryId: announcementCategoryId,
        title: discussionTitle,
        body: discussionBody,
      },
      token
    );
    log(`Github discussion ID: ${discussion.id} created.`);
  } catch (error) {
    log(`Discussion creation FAILED: ${error.message}`);
  }
}

(async function () {
  const options = await buildOptions();

  const runner = new StepsRunner();

  let packageVersionId: string;

  try {
    runner.add(async (log) => await authorizePublishingOrg(log, options));
    runner.add(async (log) => {
      options.packageVersion = await getPackageVersion(log);
    });
    options.promote &&
      runner.add(async (log) => await ensurePackageNotPublished(log, options));
    options.removeTranslations &&
      runner.add(async (log) => await removeTranslations(log));
    runner.add(async (log) => {
      packageVersionId = (await createPackage(log, options)).result
        .SubscriberPackageVersionId;
      !options.promote &&
        log(
          JSON.stringify(
            await getMatchingPackageVersion(options.packageVersion),
            null,
            2
          )
        );
    });
    options.promote &&
      runner
        .add(async (log) => await promotePackage(log, packageVersionId))
        .add(
          async (log) =>
            await createGithubDiscussionPost(log, options, packageVersionId)
        );

    await runner.run();
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);

    throw error;
  }
})();
