import * as fs from 'fs';
import * as path from 'path';
import {
  deleteOrg,
  orgExists,
  sfdx,
  SfdxPublishCommunityResponse,
} from './util/sfdx';
import {buildLogger} from './util/log';

interface Options {
  alias: string;
  configFile: string;
  community: {
    name: string;
    path: string;
    template: string;
  };
  deleteOrgOnError: boolean;
}

let step = 0;
const totalSteps = 6;
const log = buildLogger(totalSteps, () => step);

const createScratchOrg = async (options: Options): Promise<void> => {
  await sfdx(
    `force:org:create -s -f config/project-scratch-def.json -a ${options.alias}`
  );
};

const ensureScratchOrgExists = async (options: Options) => {
  ++step;
  log(`Searching for ${options.alias} organization...`);

  if (await orgExists(options.alias)) {
    log(`${options.alias} organization found.`);
  } else {
    log(`${options.alias} organization not found. Creating organization.`);
    await createScratchOrg(options);
    log('Organization created successfully.');
  }
};

const createCommunity = async (options: Options): Promise<void> => {
  await sfdx(
    `force:community:create -u ${options.alias} -n "${options.community.name}" -p ${options.community.path} -t "${options.community.template}"`
  );
};

const ensureCommunityExists = async (options: Options): Promise<void> => {
  ++step;
  log(`Searching for '${options.community.name}' community`);
  try {
    await createCommunity(options);
    log('Community created successfully.');
  } catch (error) {
    if (error.message === 'Enter a different name. That one already exists.') {
      log('Community found.');
    } else {
      throw error;
    }
  }
};

const deployComponents = async (options: Options): Promise<void> => {
  ++step;
  log('Deploying components...');
  await sfdx(
    `force:source:deploy -u ${options.alias} -p force-app/main,force-app/examples`
  );
  log('Components deployed.');
};

const deployCommunityMetadata = async (options: Options): Promise<void> => {
  ++step;
  log('Deploying community metadata...');

  // There is no easy way to know when the community is ready.
  // The first deploy attempt may fail.
  let retry = 0;
  let success = false;
  do {
    try {
      await sfdx(
        `force:mdapi:deploy -u ${options.alias} -d quantic-examples-community -w 10`
      );
      success = true;
    } catch (error) {
      if (retry === 2) {
        throw error;
      }
      retry++;
    }
  } while (!success && retry <= 2);

  log('Community metadata deployed.');
};

const publishCommunity = async (options: Options): Promise<string> => {
  ++step;
  log('Publishing community...');
  const response = await sfdx<SfdxPublishCommunityResponse>(
    `force:community:publish -u ${options.alias} -n "${options.community.name}"`
  );
  log('Community published.');

  return response.result.url;
};

const updateCommunityConfigFile = async (
  options: Options,
  communityUrl: string
): Promise<void> => {
  ++step;
  let baseConfig = {
    env: {
      examplesUrl: '',
    },
  };

  log(`Searching for configuration file '${options.configFile}'...`);
  if (fs.existsSync(options.configFile)) {
    log('Configuration file found. Merging settings.');
    baseConfig = JSON.parse(fs.readFileSync(options.configFile, 'UTF-8'));
  } else {
    log('Creating configuration file...');
  }
  baseConfig.env.examplesUrl = communityUrl;

  fs.writeFileSync(
    options.configFile,
    JSON.stringify(baseConfig, null, 2),
    'UTF-8'
  );
  log('Configuration file updated.');
};

const deleteScratchOrg = async (options: Options): Promise<void> => {
  log(`Deleting ${options.alias} organization...`);
  await deleteOrg(options.alias);
  log('Organization deleted successfully.');
};

(async function () {
  const options = {
    alias: 'LWC',
    configFile: path.resolve('cypress/plugins/config/examples-community.json'),
    community: {
      name: 'Quantic Examples',
      path: 'examples',
      template: 'Build Your Own',
    },
    deleteOrgOnError: process.argv.some(
      (arg) => arg === '--delete-org-on-error'
    ),
  };

  let scratchOrgCreated = false;

  try {
    await ensureScratchOrgExists(options);
    scratchOrgCreated = true;

    await ensureCommunityExists(options);
    await deployComponents(options);
    await deployCommunityMetadata(options);
    const communityUrl = await publishCommunity(options);
    await updateCommunityConfigFile(options, communityUrl);

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
      await deleteScratchOrg(options);
    }

    throw error;
  }
})();
