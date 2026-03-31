import {test as base} from '@playwright/test';
import {IpxRefineTogglePageObject} from './page-object';

interface IpxRefineToggleFixture {
  ipxRefineToggle: IpxRefineTogglePageObject;
}

export const test = base.extend<IpxRefineToggleFixture>({
  ipxRefineToggle: async ({page}, use) => {
    await use(new IpxRefineTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
