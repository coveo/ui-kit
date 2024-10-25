import {test as base} from '@playwright/test';
import {SearchObject} from '../page-object/search-object';
import {InsightObject} from '../page-object/insight-object';
import {ConfigurationObject} from '../page-object/configuration-object';

type QuanticBaseE2EFixtures = {
  configuration: ConfigurationObject;
  search: SearchObject;
  insight?: InsightObject;
};

export const quanticBase = base.extend<QuanticBaseE2EFixtures>({
  configuration: async ({page}, use) => {
    await use(new ConfigurationObject(page));
  },
  search: async ({page}, use) => {
    await use(new SearchObject(page, 'search'));
  },
  insight: async ({page}, use) => {
    await use(new InsightObject(page));
  },
});
