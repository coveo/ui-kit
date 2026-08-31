import {getActiveScratchOrgUsernames, authorizeOrg} from './util/sfdx-commands';

const COMMIT_SHA_PREFIX_LENGTH = 6;

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

async function resolveOrgUsername(): Promise<string> {
  const devHubUsername = process.env.SFDX_AUTH_JWT_USERNAME!;
  const scratchOrgName = getCiOrgName();

  await authorizeOrg({
    username: devHubUsername,
    isScratchOrg: false,
    jwtClientId: process.env.SFDX_AUTH_CLIENT_ID!,
    jwtKeyFile: process.env.SFDX_AUTH_JWT_KEY_FILE!,
  });

  const usernames = await getActiveScratchOrgUsernames(
    devHubUsername,
    scratchOrgName
  );

  if (usernames.length === 0) {
    throw new Error(
      `Could not find an active scratch organization named ${scratchOrgName}.`
    );
  }

  if (usernames.length > 1) {
    console.warn(
      `Found ${usernames.length} active scratch organizations named ${scratchOrgName}; using ${usernames[0]}.`
    );
  }

  return usernames[0];
}

(async function () {
  try {
    ensureEnvVariables();
    process.stdout.write(`${await resolveOrgUsername()}\n`);
  } catch (error) {
    console.error('Failed to resolve scratch organization username.');
    console.error(error);
    process.exitCode = 1;
  }
})();
