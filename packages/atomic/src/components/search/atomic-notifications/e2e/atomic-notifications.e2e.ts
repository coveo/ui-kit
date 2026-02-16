import {expect, test} from './fixture';

test.describe('atomic-notifications', () => {
  test.beforeEach(async ({notifications}) => {
    await notifications.load();
    await notifications.hydrated.waitFor();
  });

  test('should render notifications', async ({notifications}) => {
    await expect(notifications.notification(0)).toBeVisible();
    await expect(notifications.notification(1)).toBeVisible();
  });
});
