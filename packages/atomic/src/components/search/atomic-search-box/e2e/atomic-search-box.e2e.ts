import {expect, test} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({args: {suggestionTimeout: 5000}});
  });

  test('should have an enabled search button', async ({searchBox}) => {
    await expect(searchBox.submitButton).toBeEnabled();
  });

  test.describe('after clicking the searchbox input', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
    });

    test('should display suggested queries', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).toBeVisible();
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
    await searchBox.load({
      args: {suggestionTimeout: 5000},
      story: 'rich-search-box',
    });
  });

  test.describe('with recent queries', () => {
    test.beforeEach(async ({searchBox, page}) => {
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
      await searchBox.searchInput.fill('shoe');
      await searchBox.searchInput.press('Enter');
      await searchBox.clearButton.waitFor({state: 'visible'});
      await searchBox.searchInput.fill('');
      await page.waitForLoadState('networkidle');
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

    test('should display in the search box what has been submitted', async ({
      searchBox,
    }) => {
      await searchBox.searchInput.fill('shoe');
      await searchBox.submitButton.click();
      await expect(searchBox.searchInput).toHaveValue('shoe');
    });

    test.describe('after focusing on suggestion with the mouse', () => {
      test('should submit what is in the search box regardless of the mouse position', async ({
        searchBox,
      }) => {
        await searchBox.searchInput.fill('shoe');
        await searchBox.searchSuggestions({listSide: 'Left'}).first().hover();
        await searchBox.searchInput.press('Enter');
        await expect(searchBox.searchInput).toHaveValue('shoe');
      });
    });

    test.describe('after updating the redirect-url attribute', () => {
      test.beforeEach(async ({searchBox}) => {
        await searchBox.component.evaluate((node) =>
          node.setAttribute(
            'redirection-url',
            './iframe.html?id=atomic-search-box--in-page&viewMode=story&args=enable-query-syntax:!true;suggestion-timeout:5000'
          )
        );
      });

      test('should redirect to the specified url after selecting a suggestion', async ({
        page,
        searchBox,
      }) => {
        const suggestionText = await searchBox
          .searchSuggestions()
          .first()
          .textContent();

        expect(suggestionText).not.toBeNull();

        await searchBox.searchSuggestions().first().click();
        await page.waitForURL('**/iframe.html?id=atomic-search-box--in-page*');
        await expect(searchBox.searchInput).toHaveValue(suggestionText ?? '');
      });
    });
  });

  test.describe('when hovering a instant result and pressing Enter', () => {
    test('should execute the query in the search box', async ({searchBox}) => {
      await searchBox.searchInput.click();
      await searchBox.searchInput.fill('a');
      await searchBox.instantResult({listSide: 'Right'}).first().hover();
      await searchBox.searchInput.press('Enter');
      await expect(searchBox.searchInput).toHaveValue('a');
    });
  });
});

test.describe('with disable-search=true and minimum-query-length=1', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({
      args: {
        suggestionTimeout: 5000,
        disableSearch: true,
        minimumQueryLength: 1,
      },
    });
  });

  const testCases = () => {
    test('the submit button is disabled', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeDisabled();
    });

    test('there are no search suggestions', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
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
      await page.getByPlaceholder('Search').fill('textured');
    });

    testCases();
  });
});

test.describe('with minimum-query-length=4', () => {
  test.beforeEach(async ({searchBox}) => {
    await searchBox.load({
      args: {minimumQueryLength: 4, suggestionTimeout: 5000},
    });
    await searchBox.hydrated.waitFor();
  });

  const testCases = () => {
    test('the submit button is disabled', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeDisabled();
    });

    test('there are no search suggestions', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
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
      await page.getByPlaceholder('Search').fill('textured');
    });

    test('the submit button is disabled', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeEnabled();
    });

    test('there are no search suggestions', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).toBeVisible();
    });
  });
});

test('should have position:relative and z-index:10', async ({searchBox}) => {
  await searchBox.load();

  await expect(searchBox.hydrated).toHaveCSS('position', 'relative');
  await expect(searchBox.hydrated).toHaveCSS('z-index', '10');
});
