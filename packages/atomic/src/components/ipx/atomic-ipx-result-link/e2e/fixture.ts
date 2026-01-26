import {test as base} from '@playwright/test';
import {IpxResultLinkPageObject} from './page-object';

type MyFixtures = {
  ipxResultLink: IpxResultLinkPageObject;
};

export const test = base.extend<MyFixtures>({
  ipxResultLink: async ({page}, use) => {
    await use(new IpxResultLinkPageObject(page));
  },
});

export {expect} from '@playwright/test';
