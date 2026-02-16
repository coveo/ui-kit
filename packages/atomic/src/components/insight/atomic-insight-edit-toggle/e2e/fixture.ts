import {test as base} from '@playwright/test';
import {EditTogglePageObject} from './page-object';

type AtomicInsightEditToggleE2EFixtures = {
  editToggle: EditTogglePageObject;
};

export const test = base.extend<AtomicInsightEditToggleE2EFixtures>({
  editToggle: async ({page}, use) => {
    await use(new EditTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
