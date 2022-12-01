import {StepLogger, StepsRunner} from './util/log';
import * as sfdx from './util/sfdx-commands';

interface Options {
  alias: string;
}

const deleteScratchOrg = async (log: StepLogger, options: Options) => {
  log(`Deleting ${options.alias} organization...`);

  if (await sfdx.orgExists(options.alias)) {
    await sfdx.deleteOrg(options.alias);
  }

  log('Organization deleted successfully');
};

const resetOrgAlias = async (log: StepLogger, options: Options) => {
  log(`Resetting ${options.alias} alias...`);
  await sfdx.setAlias(options.alias, '');
  log('Alias reset successfully');
};

(async function () {
  const options = {
    alias: 'LWC',
  };

  try {
    await new StepsRunner()
      .add(async (log) => await deleteScratchOrg(log, options))
      .add(async (log) => await resetOrgAlias(log, options))
      .run();
  } catch (error) {
    console.error('Failed to complete');
    console.error(error);
  }
})();
