import {test as base} from '@playwright/test';
import {IpxButtonPageObject} from './page-object';

interface IpxButtonFixture {
  ipxButton: IpxButtonPageObject;
}

export const test = base.extend<IpxButtonFixture>({
  ipxButton: async ({page}, use) => {
    await use(new IpxButtonPageObject(page));
  },
});

export {expect} from '@playwright/test';
