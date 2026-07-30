import {StepLogger, StepsRunner} from './util/log';
import * as sfdx from './util/sfdx-commands';
import {SfdxJWTAuth, authorizeOrg} from './util/sfdx-commands';

const COMMIT_SHA_PREFIX_LENGTH = 6;

interface Options {
  jwt: SfdxJWTAuth;
  scratchOrgName: string;
}

function ensureEnvVariables() {
  [
    'COMMIT_SHA',
    'SFDX_AUTH_CLIENT_ID',
    'SFDX_AUTH_JWT_KEY_FILE',
    'SFDX_AUTH_JWT_USERNAME',
  ].forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`The environment variable ${variable} must be defined.`);
    }
  });
}

function getCiOrgName() {
  return `quantic-${process.env.COMMIT_SHA!.substring(
    0,
    COMMIT_SHA_PREFIX_LENGTH
  )}`;
}

async function authorizeDevHub(log: StepLogger, options: Options) {
  log(`Authorizing Dev Hub user: ${options.jwt.username}`);
  await authorizeOrg({
    username: options.jwt.username,
    isScratchOrg: false,
    jwtClientId: options.jwt.clientId,
    jwtKeyFile: options.jwt.keyFile,
  });
  log('Dev Hub authorization successful.');
}

async function deleteScratchOrgs(log: StepLogger, options: Options) {
  log(
    `Searching the Dev Hub for active ${options.scratchOrgName} scratch organizations...`
  );

  const {foundOrgUsernames, deletedOrgUsernames} =
    await sfdx.deleteActiveScratchOrgs({
      devHubUsername: options.jwt.username,
      scratchOrgName: options.scratchOrgName,
      jwtClientId: options.jwt.clientId,
      jwtKeyFile: options.jwt.keyFile,
    });

  if (foundOrgUsernames.length === 0) {
    console.warn(
      `Could not find an active scratch organization named ${options.scratchOrgName} to delete.`
    );
    return;
  }

  if (deletedOrgUsernames.length !== foundOrgUsernames.length) {
    console.warn(
      `Deleted ${deletedOrgUsernames.length}/${foundOrgUsernames.length} scratch org(s) named ${options.scratchOrgName}.`
    );
  }

  deletedOrgUsernames.forEach((username) => {
    log(`Organization ${username} deleted successfully.`);
  });
}

(async function () {
  try {
    ensureEnvVariables();
    const options = {
      jwt: {
        clientId: process.env.SFDX_AUTH_CLIENT_ID!,
        keyFile: process.env.SFDX_AUTH_JWT_KEY_FILE!,
        username: process.env.SFDX_AUTH_JWT_USERNAME!,
      },
      scratchOrgName: getCiOrgName(),
    };

    await new StepsRunner()
      .add(async (log) => await authorizeDevHub(log, options))
      .add(async (log) => await deleteScratchOrgs(log, options))
      .run();
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);
  }
})();
