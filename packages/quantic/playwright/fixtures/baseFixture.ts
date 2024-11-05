import {test as base} from '@playwright/test';
import {ConfigurationObject} from '../page-object/configurationObject';

type QuanticBaseE2EFixtures = {
  configuration: ConfigurationObject;
};

export const quanticBase = base.extend<QuanticBaseE2EFixtures>({
  configuration: async ({page}, use) => {
    await use(new ConfigurationObject(page));
  },
});
