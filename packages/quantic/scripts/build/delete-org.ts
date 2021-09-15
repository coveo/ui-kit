import {deleteOrg, orgExists, sfdx} from './util/sfdx';
import {buildLogger} from './util/log';

interface Options {
  alias: string;
}

let step = 0;
const totalSteps = 2;
const log = buildLogger(totalSteps, () => step);

const deleteScratchOrg = async (options: Options) => {
  ++step;
  log(`Deleting ${options.alias} organization...`);

  if (await orgExists(options.alias)) {
    await deleteOrg(options.alias);
  }

  log('Organization deleted successfully');
};

const resetOrgAlias = async (options: Options) => {
  ++step;
  log(`Resetting ${options.alias} alias...`);
  await sfdx(`alias:set ${options.alias}=""`);
  log('Alias reset successfully');
};

(async function () {
  const options = {
    alias: 'LWC',
  };

  try {
    await deleteScratchOrg(options);
    await resetOrgAlias(options);
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);
  }
})();
