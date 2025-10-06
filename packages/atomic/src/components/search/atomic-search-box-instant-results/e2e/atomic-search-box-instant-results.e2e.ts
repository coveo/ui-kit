import {expect, test} from './fixture';

test.describe('atomic-search-box-instant-results', () => {
  test.beforeEach(async ({searchBoxInstantResults, searchBox}) => {
    await searchBoxInstantResults.load();
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.click();
  });

  test('should show instant results for the active query suggestion', async ({
    searchBox,
    page,
  }) => {
    await searchBox.searchInput.fill('test');
    await searchBox.searchInput.waitFor({
      state: 'visible',
    });

    const instantResults = page.locator(
      'atomic-search-box-instant-results atomic-result'
    );
    await expect(instantResults.first()).toBeVisible({timeout: 10000});
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
