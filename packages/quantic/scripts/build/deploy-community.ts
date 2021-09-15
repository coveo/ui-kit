import * as fs from 'fs';
import * as path from 'path';
import {
  sfdx,
  SfdxListOrgsResponse,
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
}

let step = 0;
const totalSteps = 6;
const log = buildLogger(totalSteps, () => step);

const scratchOrgExists = async (options: Options): Promise<boolean> => {
  const response = await sfdx<SfdxListOrgsResponse>('force:org:list');

  const org = response.result.scratchOrgs.find(
    (o) => o.alias === options.alias
  );

  const isOrgFound = !!org;
  const isOrgActive = isOrgFound && org.status === 'Active';

  if (isOrgFound && !isOrgActive) {
    console.warn(
      `Org ${options.alias} is found but status is not active. Status is ${org.status}.`
    );
  }

  return isOrgActive;
};

const createScratchOrg = async (options: Options): Promise<void> => {
  await sfdx(
    `force:org:create -s -f config/project-scratch-def.json -a ${options.alias}`
  );
};

const ensureScratchOrgExists = async (options: Options) => {
  ++step;
  log(`Searching for ${options.alias} organization...`);

  if (await scratchOrgExists(options)) {
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
  await sfdx(
    `force:mdapi:deploy -u ${options.alias} -d quantic-examples-community -w 10`
  );
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

(async function () {
  const options = {
    alias: 'LWC',
    configFile: path.resolve('cypress/plugins/config/examples-community.json'),
    community: {
      name: 'Quantic Examples',
      path: 'examples',
      template: 'Build Your Own',
    },
  };

  try {
    await ensureScratchOrgExists(options);
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
    throw error;
  }
})();
