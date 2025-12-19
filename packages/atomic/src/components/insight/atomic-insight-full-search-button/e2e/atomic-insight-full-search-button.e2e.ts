import {expect, test} from './fixture';

test.describe('atomic-insight-full-search-button', () => {
  test.beforeEach(async ({fullSearchButton}) => {
    await fullSearchButton.load();
  });

  test('should display the full search button', async ({fullSearchButton}) => {
    await expect(fullSearchButton.button).toBeVisible();
  });
});
