import {test as base} from '@playwright/test';
import {IpxBodyPageObject} from './page-object';

interface IpxBodyFixture {
  ipxBody: IpxBodyPageObject;
}

export const test = base.extend<IpxBodyFixture>({
  ipxBody: async ({page}, use) => {
    await use(new IpxBodyPageObject(page));
  },
});

export {expect} from '@playwright/test';
