import {test as base} from '@playwright/test';
import {AtomicIpxRecsListPageObject as IpxRecsList} from './page-object';

type MyFixtures = {
  ipxRecsList: IpxRecsList;
};

export const test = base.extend<MyFixtures>({
  ipxRecsList: async ({page}, use) => {
    await use(new IpxRecsList(page));
  },
});

export {expect} from '@playwright/test';
