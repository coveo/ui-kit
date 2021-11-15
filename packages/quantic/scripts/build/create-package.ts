/* eslint-disable node/no-unsupported-features/node-builtins */
import * as fs from 'fs';
// eslint-disable-next-line node/no-extraneous-import
import {Octokit} from '@octokit/rest';
import * as sfdx from './util/sfdx-commands';
import {StepLogger, StepsRunner} from './util/log';
import {
  authorizeOrg,
  SfdxJWTAuth,
  SfdxCreatePackageVersionResponse,
} from './util/sfdx-commands';
import * as pack from '../../package.json';

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

function getLatestPackageVersion(): string {
  return pack.version;
}

async function buildOptions(): Promise<Options> {
  const ci = isCi();

  if (ci) {
    ensureEnvVariables();
  }

  return {
    packageVersion: getLatestPackageVersion(),
    packageId: '0Ho6g000000k9g8CAA',
    promote: true,
    removeTranslations: true,
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
  await fs.promises
    .readdir('force-app/main/translations/')
    .then((f) => Promise.all(f.map((e) => fs.promises.unlink(e))));
  log('Removed translation files');
}

async function createPackage(
  log: StepLogger,
  options: Options
): Promise<SfdxCreatePackageVersionResponse> {
  log('Deploying community metadata...');

  const response = await sfdx.createPackageVersion({
    packageId: options.packageId,
    packageVersion: options.packageVersion,
    timeout: 30,
  });

  log('Community metadata deployed.');
  return response;
}

async function promotePackage(log: StepLogger, packageVersionId: string) {
  log(`Promoting package ${packageVersionId} to released status...`);

  await sfdx.promotePackageVersion({
    packageVersionId,
  });
  log(`Quantic package ${packageVersionId} published.`);
}

async function createGithubRelease(log: StepLogger, packageVersionId: string) {
  const token = process.env.GITHUB_TOKEN || '';
  const github = new Octokit({auth: token});

  const packageDetails = (await sfdx.getPackageVersionList()).result.find(
    (pack) => pack.SubscriberPackageVersionId === packageVersionId
  );
  const releaseName = `${
    packageDetails.Package2Name
  } v${getLatestPackageVersion()}`;

  log('Creating Github release...');
  await github.repos.createRelease({
    owner: 'coveo',
    repo: 'ui-kit',
    tag_name: releaseName,
    name: releaseName,
    body: `Package ID: ${packageDetails.SubscriberPackageVersionId}\nInstallation URL: ${packageDetails.InstallUrl}`,
  });
  log('Creating Github release...');
}

(async function () {
  const options = await buildOptions();

  const runner = new StepsRunner();

  let packageVersionId: string;

  try {
    runner
      .add(async (log) => await authorizePublishingOrg(log, options))
      .add(async (log) => await removeTranslations(log))
      .add(async (log) => {
        packageVersionId = await (
          await createPackage(log, options)
        ).result.Package2VersionId;
      })
      .add(async (log) => await promotePackage(log, packageVersionId))
      .add(async (log) => await createGithubRelease(log, packageVersionId));

    await runner.run();
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);

    throw error;
  }
})();
