import * as fs from 'fs';
import * as path from 'path';
import {StepLogger, StepsRunner} from './util/log';
import * as sfdx from './util/sfdx-commands';
import {SfdxJWTAuth} from './util/sfdx-commands';
import waitOn from 'wait-on';

interface Options {
  configFile: string;
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

function getBranchName() {
  return process.env.BRANCH_NAME.replace(/[^a-zA-Z0-9-]/g, '-');
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

async function buildOptions(): Promise<Options> {
  const ci = isCi();

  if (ci) {
    ensureEnvVariables();
  }

  return {
    configFile: path.resolve('cypress/plugins/config/examples-community.json'),
    community: {
      name: 'Quantic Examples',
      path: 'examples',
      template: 'Build Your Own',
    },
    scratchOrg: {
      alias: 'LWC',
      defFile: await prepareScratchOrgDefinitionFile(
        path.resolve('config/project-scratch-def.json')
      ),
      duration: ci ? 1 : 7,
    },
    jwt: {
      clientId: process.env.SFDX_AUTH_CLIENT_ID,
      keyFile: process.env.SFDX_AUTH_JWT_KEY,
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

  await sfdx.deploySource({
    alias: options.scratchOrg.alias,
    packagePaths: ['force-app/main', 'force-app/examples'],
  });

  log('Components deployed.');
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

async function updateCommunityConfigFile(
  log: StepLogger,
  options: Options,
  communityUrl: string
): Promise<void> {
  let baseConfig = {
    env: {
      examplesUrl: '',
    },
  };

  log(`Searching for configuration file '${options.configFile}'...`);
  if (fs.existsSync(options.configFile)) {
    log('Configuration file found. Merging settings.');
    baseConfig = JSON.parse(
      fs.readFileSync(options.configFile, {
        encoding: 'utf-8',
      })
    );
  } else {
    log('Creating configuration file...');
  }
  baseConfig.env.examplesUrl = communityUrl;

  fs.writeFileSync(options.configFile, JSON.stringify(baseConfig, null, 2), {
    encoding: 'utf-8',
  });
  log('Configuration file updated.');
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
  const options = await buildOptions();

  let scratchOrgCreated = false;
  const runner = new StepsRunner();

  try {
    let communityUrl = '';

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
          await updateCommunityConfigFile(log, options, communityUrl)
      )
      .add(async (log) => await waitForCommunity(log, communityUrl));

    await runner.run();

    console.log(
      `\nThe '${options.community.name}' community is ready, you can access it at the following URL:`
    );
    console.log(communityUrl);
    console.log('\nTo open Cypress, run:');
    console.log('npm run cypress:open');
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);

    if (options.deleteOrgOnError && scratchOrgCreated) {
      await deleteScratchOrg(runner.getLogger(), options);
    }

    throw error;
  }
})();
