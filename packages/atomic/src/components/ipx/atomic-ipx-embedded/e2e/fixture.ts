import {test as base} from '@playwright/test';
import {IpxEmbeddedPageObject} from './page-object';

type IpxEmbeddedFixtures = {
  ipxEmbedded: IpxEmbeddedPageObject;
};

export const test = base.extend<IpxEmbeddedFixtures>({
  ipxEmbedded: async ({page}, use) => {
    await use(new IpxEmbeddedPageObject(page));
  },
});

export {expect} from '@playwright/test';
