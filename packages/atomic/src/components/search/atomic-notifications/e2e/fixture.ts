import {test as base} from '@playwright/test';
import {NotificationsPageObject} from './page-object';

interface TestFixture {
  notifications: NotificationsPageObject;
}

export const test = base.extend<TestFixture>({
  notifications: async ({page}, use) => {
    await use(new NotificationsPageObject(page));
  },
});
export {expect} from '@playwright/test';
