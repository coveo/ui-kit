import {expect, test} from './fixture';

test.describe('atomic-ipx-recs-list', () => {
  test.beforeEach(async ({ipxRecsList}) => {
    await ipxRecsList.load();
    await ipxRecsList.hydrated.waitFor();
  });

  test('should render recommendations', async ({ipxRecsList}) => {
    await expect(ipxRecsList.recommendations.first()).toBeVisible();
  });
});
