import {expect, test} from './fixture';

test.describe('AtomicResultIcon', () => {
  test.beforeEach(async ({icon}) => {
    await icon.load();
  });

  test('atomic-icon loads assets:// files', async ({icon}) => {
    await expect(icon.svg).toBeVisible();
  });
});
