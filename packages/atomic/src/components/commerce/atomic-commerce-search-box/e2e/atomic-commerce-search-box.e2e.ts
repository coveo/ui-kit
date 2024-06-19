import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({suggestionTimeout: 5000});
  });

  test('should have an enabled search button', async ({searchBox}) => {
    await expect(searchBox.submitButton).toBeEnabled();
  });

  test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
    await searchBox.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test.describe('after clicking the searchbox input', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
    });

    test('should display suggested queries', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).toBeVisible();
    });

    test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
      await searchBox.hydrated.waitFor();
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
    });

    test.describe('after clicking the submit button', () => {
      test.beforeEach(async ({searchBox}) => {
        await searchBox
          .searchSuggestions()
          .first()
          .waitFor({state: 'visible', timeout: 10e3});
        await searchBox.submitButton.click();
      });

      test('should collapse the suggested queries', async ({searchBox}) => {
        await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
      });
    });
  });
});

test.describe('with instant results & query suggestions', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({suggestionTimeout: 5000}, 'rich-search-box');
  });

  test.describe('with recent queries', () => {
    test.beforeEach(async ({searchBox, page}) => {
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
      await searchBox.searchInput.fill('kayak');
      await searchBox.searchInput.press('Enter');
      await page.waitForResponse(
        (res) =>
          res.url().endsWith('/commerce/v2/search') && res.status() === 200
      );
      await searchBox.searchInput.fill('');
    });

    test('should display recent queries', async ({searchBox}) => {
      await expect(searchBox.recentQueries().first()).toBeVisible();
    });

    test('should clear recent queries when clicking the clear button', async ({
      searchBox,
    }) => {
      await searchBox.clearRecentQueriesButton.click();
      await expect(searchBox.recentQueries().first()).not.toBeVisible();
    });

    test('should clear recent queries when pressing enter while the clear button is focused', async ({
      searchBox,
    }) => {
      await searchBox.clearRecentQueriesButton.hover();
      await searchBox.searchInput.press('Enter');
      await expect(searchBox.recentQueries().first()).not.toBeVisible();
    });
  });

  test.describe('after clicking the searchbox input', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.searchInput.click();
    });

    test('should display suggested queries', async ({searchBox}) => {
      await expect(
        searchBox.searchSuggestions({listSide: 'Left'}).first()
      ).toBeVisible();
    });

    test('should display instant results', async ({searchBox}) => {
      await expect(
        searchBox.instantResult({listSide: 'Right'}).first()
      ).toBeVisible();
    });

    test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
      await searchBox.hydrated.waitFor();
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
    });

    test('should display in the search box what has been submitted', async ({
      searchBox,
    }) => {
      await searchBox.searchInput.fill('Rec');
      await searchBox.searchInput.press('Enter');
      await expect(searchBox.searchInput).toHaveValue('Rec');
    });

    test.describe('after focusing on suggestion with the mouse', () => {
      test('should submit what is in the search box regardless of the mouse position', async ({
        searchBox,
      }) => {
        await searchBox.searchInput.fill('Rec');
        await searchBox.searchSuggestions({listSide: 'Left'}).first().hover();
        await searchBox.searchInput.press('Enter');
        await expect(searchBox.searchInput).toHaveValue('Rec');
      });
    });
  });
});

test.describe('with disable-search=true and minimum-query-length=1', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({
      suggestionTimeout: 5000,
      disableSearch: true,
      minimumQueryLength: 1,
    });
  });

  const testCases = () => {
    test('the submit button is disabled', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeDisabled();
    });

    test('there are no search suggestions', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
    });

    test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
      await searchBox.hydrated.waitFor();
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
    });
  };

  testCases();

  test.describe('after clicking the searchbox input', () => {
    test.beforeEach(async ({searchBox}) => {
      await expect(searchBox.searchInput).toBeEnabled();
    });

    testCases();
  });

  test.describe('after typing a query above the threshold', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').fill('kayak');
    });

    testCases();
  });
});

test.describe('with minimum-query-length=4', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({minimumQueryLength: 4, suggestionTimeout: 5000});
  });

  const testCases = () => {
    test('the submit button is disabled', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeDisabled();
    });

    test('there are no search suggestions', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
    });

    test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
      await searchBox.hydrated.waitFor();
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
    });
  };

  testCases();

  test.describe('after clicking the searchbox input', () => {
    test.beforeEach(async ({searchBox}) => {
      await expect(searchBox.searchInput).toBeEnabled();
    });

    testCases();
  });

  test.describe('after typing a query below the threshold', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').fill('kay');
    });

    testCases();
  });

  test.describe('after typing a query above the threshold', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').fill('kayak');
    });

    test('the submit button is disabled', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeEnabled();
    });

    test('there are no search suggestions', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).toBeVisible();
    });
  });
});

test.describe('with a facet & clear-filters set to true', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load(
      {clearFilters: true, suggestionTimeout: 5000},
      'in-page'
    );
  });

  test('clicking the submit button should clear the facet value', async ({
    facets,
    searchBox,
  }) => {
    await facets.inclusionFilters.first().click();
    await facets.clearFilters().waitFor({state: 'visible'});
    await searchBox.submitButton.click();
    await expect(facets.clearFilters()).not.toBeVisible();
  });
});

test.describe('with a facet & clear-filters set to false', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load(
      {clearFilters: false, suggestionTimeout: 5000},
      'in-page'
    );
  });

  test('clicking the submit button should not clear the facet value', async ({
    facets,
    searchBox,
  }) => {
    await facets.inclusionFilters.first().click();
    await facets.clearFilters().waitFor({state: 'visible'});
    await searchBox.submitButton.click();
    await expect(facets.clearFilters()).toBeVisible();
  });
});
