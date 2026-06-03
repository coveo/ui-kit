import {test as base} from '@playwright/test';
import {AtomicIpxModalPageObject} from './page-object';

type Fixtures = {
  ipxModal: AtomicIpxModalPageObject;
};

export const test = base.extend<Fixtures>({
  ipxModal: async ({page}, use) => {
    await use(new AtomicIpxModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
