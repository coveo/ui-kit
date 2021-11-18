/* eslint-disable node/no-unsupported-features/node-builtins */
import * as fs from 'fs';
/* eslint-disable-next-line node/no-extraneous-import */
import {Octokit} from '@octokit/rest';
import * as sfdx from './util/sfdx-commands';
import * as path from 'path';
import {StepLogger, StepsRunner} from './util/log';
import {
  authorizeOrg,
  SfdxJWTAuth,
  SfdxCreatePackageVersionResponse,
} from './util/sfdx-commands';
import * as pack from '../../package.json';

require('dotenv').config();

interface Options {
  packageVersion: string;
  packageId: string;
  promote: boolean;
  removeTranslations: boolean;
  jwt: SfdxJWTAuth;
}

function ensureEnvVariables() {
  [
    'GITHUB_TOKEN',
    'SFDX_AUTH_CLIENT_ID',
    'SFDX_AUTH_JWT_KEY',
    'SFDX_AUTH_JWT_USERNAME',
  ].forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`The environment variable ${v} must be defined.`);
    }
  });
}

function isCi() {
  return process.argv.some((arg) => arg === '--ci');
}

async function getMatchingPackageVersion(versionNumber: string) {
  return (await sfdx.getPackageVersionList()).result.find(
    (pkg) =>
      pkg.Version === versionNumber ||
      pkg.Version.slice(0, -2) === versionNumber
  );
}

async function getIsPublished(): Promise<boolean> {
  const matchingVersion = await getMatchingPackageVersion(pack.version);
  return matchingVersion?.IsReleased;
}

async function getPackageVersion(): Promise<string> {
  const versionNumber = pack.version;
  const matchingVersion = await getMatchingPackageVersion(pack.version);
  const buildNumber = matchingVersion
    ? Number(matchingVersion.Version.split('.').pop()) + 1
    : 0;
  return `${versionNumber}.${buildNumber}`;
}

async function buildOptions(): Promise<Options> {
  const ci = isCi();

  if (ci) {
    ensureEnvVariables();
  }

  const promote = process.argv.includes('--promote');
  const removeTranslations = process.argv.includes('--remove-translations');

  return {
    packageVersion: await getPackageVersion(),
    packageId: '0Ho6g000000k9g8CAA',
    promote: !!promote,
    removeTranslations: !!removeTranslations,
    jwt: {
      clientId: process.env.SFDX_AUTH_CLIENT_ID,
      keyFile: process.env.SFDX_AUTH_JWT_KEY,
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

async function createGithubRelease(
  log: StepLogger,
  options: Options,
  packageVersionId: string
) {
  const token = process.env.GITHUB_TOKEN || '';
  const github = new Octokit({auth: token});

  const packageDetails = (await sfdx.getPackageVersionList()).result.find(
    (pack) => pack.SubscriberPackageVersionId === packageVersionId
  );
  const releaseName = `${packageDetails.Package2Name}v${options.packageVersion}`;

  log('Creating Github release...');
  await github.rest.repos.createRelease({
    owner: 'coveo',
    repo: 'ui-kit',
    tag_name: releaseName,
    name: releaseName,
    body: `Package ID: ${packageDetails.SubscriberPackageVersionId}\nInstallation URL: ${packageDetails.InstallUrl}`,
  });
  log('Github release created.');
}

(async function () {
  const options = await buildOptions();

  const runner = new StepsRunner();

  let packageVersionId: string;

  if (options.promote && (await getIsPublished())) {
    console.info(
      `Skipped publishing ${options.packageVersion} since this patch version is already published.`
    );
    return;
  }

  try {
    runner.add(async (log) => await authorizePublishingOrg(log, options));
    options.removeTranslations &&
      runner.add(async (log) => await removeTranslations(log));
    runner.add(async (log) => {
      packageVersionId = await (
        await createPackage(log, options)
      ).result.SubscriberPackageVersionId;
      !options.promote &&
        console.log(await getMatchingPackageVersion(options.packageVersion));
    });
    options.promote &&
      runner
        .add(async (log) => await promotePackage(log, packageVersionId))
        .add(
          async (log) =>
            await createGithubRelease(log, options, packageVersionId)
        );

    await runner.run();
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);

    throw error;
  }
})();
