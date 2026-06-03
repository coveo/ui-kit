import {expect, test} from './fixture';

test.describe('atomic-no-results', () => {
  test.beforeEach(async ({noResults}) => {
    await noResults.load();
    await noResults.hydrated.waitFor();
  });

  test('should display no results message with search tips', async ({
    noResults,
  }) => {
    await expect(noResults.ariaLive()).toBeVisible();
    await expect(noResults.message()).toBeVisible();
    await expect(noResults.searchTips()).toBeVisible();
  });
});
