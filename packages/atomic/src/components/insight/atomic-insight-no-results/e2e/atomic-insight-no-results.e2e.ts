import {expect, test} from './fixture';

test.describe('atomic-insight-no-results', () => {
  test.beforeEach(async ({noResults}) => {
    await noResults.load();
    await noResults.hydrated.waitFor();
  });

  test('should be present in the page', async ({noResults}) => {
    await expect(noResults.ariaLive()).toBeVisible();
  });

  test('should display no results message', async ({noResults}) => {
    await expect(noResults.message()).toBeVisible();
  });

  test('should display search tips', async ({noResults}) => {
    await expect(noResults.searchTips()).toBeVisible();
  });
});
