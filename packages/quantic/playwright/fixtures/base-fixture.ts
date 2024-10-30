import {test as base} from '@playwright/test';
import {InsightSetupObject} from '../page-object/insight-setup-object';
import {ConfigurationObject} from '../page-object/configuration-object';

type QuanticBaseE2EFixtures = {
  configuration: ConfigurationObject;
  insightSetup?: InsightSetupObject;
};

export const quanticBase = base.extend<QuanticBaseE2EFixtures>({
  configuration: async ({page}, use) => {
    await use(new ConfigurationObject(page));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
});
