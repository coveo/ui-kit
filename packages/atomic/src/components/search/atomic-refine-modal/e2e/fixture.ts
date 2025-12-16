import {test as base} from '@playwright/test';
import {AtomicRefineModalPageObject} from './atomic-refine-modal-page-object';

type Fixtures = {
  refineModal: AtomicRefineModalPageObject;
};

export const test = base.extend<Fixtures>({
  refineModal: async ({page}, use) => {
    await use(new AtomicRefineModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
