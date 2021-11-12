import * as fs from 'fs';
import * as path from 'path';
import {StepLogger, StepsRunner} from './util/log';
import * as sfdx from './util/sfdx-commands';
import {authorizeOrg} from './util/sfdx-commands';
// eslint-disable-next-line node/no-unpublished-require
const waitOn = require('wait-on');

type VersioningBump = 'major' | 'minor' | 'patch' | 'build';

interface Options {
  versioningBump: VersioningBump;
  promote: boolean;
  jwt: {
    clientId: string;
    keyFile: string;
    username: string;
  };
}

function ensureEnvVariables() {
  [
    'BRANCH_NAME',
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

async function getLatestPackageVersion() {}

async function buildOptions(): Promise<Options> {
  const ci = isCi();

  if (ci) {
    ensureEnvVariables();
  }

  return {
    versioningBump: 'major',
    promote: true,
    jwt: {
      clientId: process.env.SFDX_AUTH_CLIENT_ID,
      keyFile: process.env.SFDX_AUTH_JWT_KEY,
      username: process.env.SFDX_AUTH_JWT_USERNAME,
    },
  };
}

async function removeTranslations(log: StepLogger) {}

async function createPackageVersion(
  log: StepLogger,
  options: Options
): Promise<void> {
  log('Deploying community metadata...');

  // There is no easy way to know when the community is ready.
  // The first deploy attempt may fail.
  let retry = 0;
  let success = false;
  do {
    try {
      await sfdx.deployCommunityMetadata({
        alias: options.scratchOrg.alias,
        communityMetadataPath: 'quantic-examples-community',
        timeout: 10,
      });

      success = true;
    } catch (error) {
      if (retry === 2) {
        throw error;
      }
      retry++;
    }
  } while (!success && retry <= 2);

  log('Community metadata deployed.');
}

async function publishPackageVersion(
  log: StepLogger,
  packageId: string
): Promise<string> {
  log(`Promoting package ${packageId} to released status...`);

  const response = await sfdx.publishCommunity({
    alias: options.scratchOrg.alias,
    communityName: options.community.name,
  });
  log(`Quantic package ${packageId} published.`);

  return response.result.url;
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

(async function () {
  const options = await buildOptions();

  const runner = new StepsRunner();

  try {
    runner
      .add(async (log) => await authorizePublishingOrg(log, options))
      .add(async (log) => await ensureCommunityExists(log, options))
      .add(async (log) => await deployComponents(log, options))
      .add(async (log) => await deployCommunity(log, options))
      .add(async (log) => {
        communityUrl = await publishCommunity(log, options);
      })
      .add(
        async (log) =>
          await updateCommunityConfigFile(log, options, communityUrl)
      )
      .add(async (log) => await waitForCommunity(log, communityUrl));

    await runner.run();
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);

    throw error;
  }
})();
