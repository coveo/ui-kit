// eslint-disable-next-line n/no-extraneous-import
import {backOff} from 'exponential-backoff';
import * as fs from 'fs';
import * as path from 'path';
import waitOn from 'wait-on';
import {StepLogger, StepsRunner} from './util/log';
import * as sfdx from './util/sfdx-commands';
import {SfdxJWTAuth, authorizeOrg} from './util/sfdx-commands';
import dotenv from 'dotenv';
import {
  getOrgNameFromScratchDefFile,
  getScratchOrgDefPath,
} from './util/scratchOrgDefUtils';
dotenv.config({path: path.resolve(__dirname, '.env')});

interface Options {
  community: {
    name: string;
    path: string;
    template: string;
  };
  deleteOldOrgs: boolean;
  deleteOrgOnError: boolean;
  jwt: SfdxJWTAuth;
  scratchOrg: {
    alias: string;
    defFile: string;
    duration: number;
  };
}

/**
 * Utility function to update or add environment variables in a .env file
 * @param {string} filePath - The path to the .env file
 * @param {object} newVariables - An object containing the key-value pairs of variables to update or add
 */
function updateEnvFile(filePath, newVariables) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
      fs.writeFileSync(filePath, '', 'utf8');
    }

    const envData = fs.readFileSync(filePath, 'utf8');

    const lines = envData.split('\n');
    const envVariables = {};

    lines.forEach((line) => {
      const [key, value] = line.split('=');
      if (key) {
        envVariables[key.trim()] = value ? value.trim() : '';
      }
    });

    Object.keys(newVariables).forEach((key) => {
      envVariables[key] = newVariables[key];
    });

    const updatedEnvContent = Object.entries(envVariables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(filePath, updatedEnvContent, 'utf8');
    console.log('.env file updated successfully!');
  } catch (error) {
    console.error(`Error updating .env file: ${error.message}`);
  }
}

function ensureEnvVariables() {
  [
    'COMMIT_SHA',
    'SFDX_AUTH_CLIENT_ID',
    'SFDX_AUTH_JWT_KEY_FILE',
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

function getBranchName() {
  return process.env.COMMIT_SHA.substring(0, 6);
}

function getCiOrgName() {
  return `quantic-${getBranchName()}`;
}

async function prepareScratchOrgDefinitionFile(
  baseDefinitionFile: string
): Promise<string> {
  if (!isCi()) {
    return baseDefinitionFile;
  }

  const orgName = getCiOrgName();
  const baseDefinition = await readDefinitionFile(baseDefinitionFile);

  const ciDefinitionFile = path.resolve(
    path.dirname(baseDefinitionFile),
    'scratch-def.ci.json'
  );
  await writeDefinitionFile(ciDefinitionFile, {
    ...baseDefinition,
    orgName,
  });

  return ciDefinitionFile;
}

async function readDefinitionFile(file: string): Promise<Object> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data.toString()));
      }
    });
  });
}

async function writeDefinitionFile(
  file: string,
  definition: Object
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(definition, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function buildOptions(scratchOrgDefPath): Promise<Options> {
  const ci = isCi();
  const orgName = getOrgNameFromScratchDefFile(scratchOrgDefPath);

  if (ci) {
    ensureEnvVariables();
  }

  return {
    community: {
      name: 'Quantic Examples',
      path: 'examples',
      template: 'Build Your Own',
    },
    scratchOrg: {
      alias: orgName,
      defFile: await prepareScratchOrgDefinitionFile(
        path.resolve(scratchOrgDefPath)
      ),
      duration: ci ? 1 : 7,
    },
    jwt: {
      clientId: process.env.SFDX_AUTH_CLIENT_ID,
      keyFile: process.env.SFDX_AUTH_JWT_KEY_FILE,
      username: process.env.SFDX_AUTH_JWT_USERNAME,
    },
    deleteOldOrgs: ci,
    deleteOrgOnError: ci,
  };
}

async function deleteOldOrgs(log: StepLogger, options: Options): Promise<void> {
  log('Deleting old scratch organizations...');

  const nbDeleted = await sfdx.deleteOldScratchOrgs({
    devHubUsername: options.jwt.username,
    scratchOrgName: getCiOrgName(),
    jwtClientId: options.jwt.clientId,
    jwtKeyFile: options.jwt.keyFile,
  });

  log(`${nbDeleted} scratch organizations deleted.`);
}

async function ensureScratchOrgExists(log: StepLogger, options: Options) {
  log(`Searching for ${options.scratchOrg.alias} organization...`);

  if (await sfdx.orgExists(options.scratchOrg.alias)) {
    log(`${options.scratchOrg.alias} organization found.`);
  } else {
    log(
      `${options.scratchOrg.alias} organization not found. Creating organization.`
    );
    await sfdx.createScratchOrg(options.scratchOrg);
    log('Organization created successfully.');
  }
}

async function ensureCommunityExists(
  log: StepLogger,
  options: Options
): Promise<void> {
  log(`Searching for '${options.community.name}' community`);
  try {
    await sfdx.createCommunity({
      alias: options.scratchOrg.alias,
      community: options.community,
    });
    log('Community created successfully.');
  } catch (error) {
    if (error.message === 'Enter a different name. That one already exists.') {
      log('Community found.');
    } else {
      throw error;
    }
  }
}

async function deployComponents(
  log: StepLogger,
  options: Options
): Promise<void> {
  log('Deploying components...');

  return backOff(async () => {
    await sfdx.deploySource({
      alias: options.scratchOrg.alias,
      packagePaths: [
        'force-app/main',
        'force-app/examples',
        'force-app/solutionExamples',
      ],
    });

    log('Components deployed.');
  });
}

async function deployCommunity(
  log: StepLogger,
  options: Options
): Promise<void> {
  log('Deploying community metadata...');

  // There is no easy way to know when the community is ready.
  // The first deploy attempt may fail.
  let retry = 0;
  let success = false;
  const maxRetries = 10;
  do {
    try {
      await sfdx.deployCommunityMetadata({
        alias: options.scratchOrg.alias,
        communityMetadataPath: 'quantic-examples-community',
        timeout: 10,
      });

      success = true;
    } catch (error) {
      if (retry === maxRetries) {
        throw error;
      }
      // The deployment may fail because the community is still being created.
      // Wait for 40 seconds then retry.
      await new Promise((resolve) => setTimeout(resolve, 40000));
      retry++;
    }
  } while (!success && retry <= maxRetries);

  log('Community metadata deployed.');
}

async function publishCommunity(
  log: StepLogger,
  options: Options
): Promise<string> {
  log('Publishing community...');

  const response = await sfdx.publishCommunity({
    alias: options.scratchOrg.alias,
    communityName: options.community.name,
  });
  log('Community published.');

  return response.result.url;
}

async function setCommunityBaseUrlAsEnvVariable(log, communityUrl, orgName) {
  const pathSegments = [__dirname, '..', '..', '.env', `${orgName}.env`];
  const envFilePath = path.join(...pathSegments);
  const newEnvVariables = {
    [`${orgName}_URL`]: communityUrl,
  };

  updateEnvFile(envFilePath, newEnvVariables);
}

async function authorizeDevOrg(log: StepLogger, options: Options) {
  log(`Authorizing user: ${options.jwt.username}`);
  await authorizeOrg({
    username: options.jwt.username,
    isScratchOrg: false,
    jwtClientId: options.jwt.clientId,
    jwtKeyFile: options.jwt.keyFile,
  });
  log('Authorization successful');
}

async function waitForCommunity(
  log: StepLogger,
  communityUrl: string
): Promise<void> {
  log(`Waiting for community at URL: ${communityUrl} ...`);

  await waitOn({
    resources: [communityUrl],
    timeout: 5 * 60 * 1000,
  });
  log('Community is now available');
}

async function deleteScratchOrg(
  log: StepLogger,
  options: Options
): Promise<void> {
  log(`Deleting ${options.scratchOrg.alias} organization...`);
  await sfdx.deleteOrg(options.scratchOrg.alias);
  log('Organization deleted successfully.');
}

(async function () {
  const scratchOrgDefPath = getScratchOrgDefPath(process.argv);
  const orgName = getOrgNameFromScratchDefFile(scratchOrgDefPath);

  const options = await buildOptions(scratchOrgDefPath);

  let scratchOrgCreated = false;
  const runner = new StepsRunner();

  try {
    let communityUrl = '';
    if (isCi()) {
      runner.add(async (log) => await authorizeDevOrg(log, options));
    }
    if (options.deleteOldOrgs) {
      runner.add(async (log) => {
        await deleteOldOrgs(log, options);
      });
    }
    runner
      .add(async (log) => {
        await ensureScratchOrgExists(log, options);
        scratchOrgCreated = true;
      })
      .add(async (log) => await ensureCommunityExists(log, options))
      .add(async (log) => await deployComponents(log, options))
      .add(async (log) => await deployCommunity(log, options))
      .add(async (log) => {
        communityUrl = await publishCommunity(log, options);
      })
      .add(
        async (log) =>
          await setCommunityBaseUrlAsEnvVariable(log, communityUrl, orgName)
      )
      .add(async (log) => await waitForCommunity(log, communityUrl));

    await runner.run();

    console.log(
      `\nThe '${options.community.name}' community is ready, you can access it at the following URL:`
    );
    console.log(communityUrl);
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);

    if (options.deleteOrgOnError && scratchOrgCreated) {
      await deleteScratchOrg(runner.getLogger(), options);
    }

    throw error;
  }
})();
