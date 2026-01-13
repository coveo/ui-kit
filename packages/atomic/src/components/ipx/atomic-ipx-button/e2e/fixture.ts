import {test as base} from '@playwright/test';
import {IpxButtonPageObject} from './page-object';

interface TestFixture {
  ipxButton: IpxButtonPageObject;
}

export const test = base.extend<TestFixture>({
  ipxButton: async ({page}, use) => {
    await use(new IpxButtonPageObject(page));
  },
});

export {expect} from '@playwright/test';
