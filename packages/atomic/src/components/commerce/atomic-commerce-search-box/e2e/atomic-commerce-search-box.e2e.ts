import {test, expect, setSuggestions, setRecentQueries} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--default&viewMode=story&args=attributes-suggestion-timeout:5000'
    );
  });

  test('should have an enabled search button', async ({searchBox}) => {
    await expect(searchBox.submitButton).toBeEnabled();
  });

  test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
    await searchBox.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test.describe('when suggestions are available', () => {
    test.beforeEach(async ({searchBox, page}) => {
      await setSuggestions(page, 4);
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
    });

    test('should display suggested queries', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).toBeVisible();
    });

    test('should update aria-live message', async ({searchBox}) => {
      await searchBox.searchSuggestions().first().waitFor({state: 'visible'});
      await expect(searchBox.ariaLive).toContainText(
        (await searchBox.searchSuggestions().count()).toString()
      );
    });

    test.describe('after clicking a suggestion', () => {
      let suggestionText: string;

      test.beforeEach(async ({searchBox}) => {
        suggestionText =
          (await searchBox.searchSuggestions().last().textContent()) ?? '';
        await searchBox.searchSuggestions().last().click();
      });

      test('should update the searchbox input', async ({searchBox}) => {
        await expect(searchBox.searchInput).toHaveValue(suggestionText);
      });

      test('should collapse the suggested queries', async ({searchBox}) => {
        await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
      });
    });

    test.describe('after focusing a suggestion', () => {
      let suggestionText: string;

      test.beforeEach(async ({searchBox}) => {
        suggestionText =
          (await searchBox.searchSuggestions().first().textContent()) ?? '';
        await searchBox.searchInput.press('ArrowDown');
      });

      test('should update the searchbox input', async ({searchBox}) => {
        await expect(searchBox.searchInput).toHaveValue(suggestionText);
      });

      test.describe('after pressing Enter', () => {
        test.beforeEach(async ({searchBox}) => {
          await searchBox.searchInput.press('Enter');
        });

        test('should collapse the suggested queries', async ({searchBox}) => {
          await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
        });
      });
    });
  });

  test.describe('when no suggestions are available', () => {
    test.beforeEach(async ({searchBox, page}) => {
      await setSuggestions(page, 0);
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
    });

    test('should display suggested queries', async ({searchBox}) => {
      await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
    });

    test('should update aria-live message', async ({searchBox}) => {
      await expect(searchBox.ariaLive).toContainText('no ');
    });
  });

  test.describe('when recent queries are available', () => {
    test.beforeEach(async ({searchBox, page}) => {
      await setRecentQueries(page, 4);
      await setSuggestions(page, 4);
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
    });

    test('should display recent queries', async ({searchBox}) => {
      await expect(searchBox.recentQueries().first()).toBeVisible();
    });

    test('should update aria-live message', async ({searchBox}) => {
      await searchBox.recentQueries().first().waitFor({state: 'visible'});
      await expect(searchBox.ariaLive).toContainText(
        Math.min(
          (await searchBox.recentQueries().count()) +
            (await searchBox.searchSuggestions().count()),
          parseInt((await searchBox.numberOfQueries) ?? '')
        ).toString()
      );
    });

    test('should clear recent queries when clicking the clear button', async ({
      searchBox,
    }) => {
      await searchBox.clearRecentQueriesButton.click();
      await expect(searchBox.recentQueries().first()).not.toBeVisible();
    });
  });

  test.describe('after clicking the searchbox input', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.searchInput.waitFor({state: 'visible'});
      await searchBox.searchInput.click();
    });

    test.describe('after entering text', () => {
      test.beforeEach(async ({searchBox}) => {
        await searchBox.searchInput.fill('kayak');
      });

      test('should display clear button when searchbox has text', async ({
        searchBox,
      }) => {
        await expect(searchBox.clearButton).toBeVisible();
      });

      test('should hide clear button when clearing input manually', async ({
        searchBox,
      }) => {
        await searchBox.searchInput.fill('');
        await expect(searchBox.clearButton).not.toBeVisible();
      });

      test('should clear searchbox when clicking the clear button', async ({
        searchBox,
      }) => {
        await searchBox.clearButton.click();
        await expect(searchBox.searchInput).toHaveText('');
        await expect(searchBox.clearButton).not.toBeVisible();
      });
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
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--rich-search-box&viewMode=story&args=attributes-suggestion-timeout:5000'
    );
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
  });
});

test.describe('with disable-search=true and minimum-query-length=1', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--default&viewMode=story&args=attributes-disable-search:!true;attributes-minimum-query-length:1;attributes-suggestion-timeout:5000'
    );
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
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--default&viewMode=story&args=attributes-minimum-query-length:4;attributes-suggestion-timeout:5000'
    );
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
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--in-page&args=attributes-clear-filters:!true;attributes-suggestion-timeout:5000'
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
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--in-page&args=attributes-clear-filters:!false;attributes-suggestion-timeout:5000'
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

test.describe('with enable-query-syntax=true', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--in-page&viewMode=story&args=attributes-enable-query-syntax:!true;attributes-suggestion-timeout:5000'
    );
  });

  test('should use query syntax', async ({loadMore, searchBox, page}) => {
    await loadMore.loadMoreButton.waitFor({state: 'visible'});
    await searchBox.searchInput
      // eslint-disable-next-line @cspell/spellchecker
      .fill('@urihash=bzo5fpM1vf8Xñds1');
    await searchBox.submitButton.click();
    await expect(loadMore.summary({total: 1})).toBeVisible();
    await expect(page.getByText('WiLife Life Jacket WiLife')).toBeVisible();
  });
});

test.describe('standalone searchbox', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--standalone-search-box&viewMode=story&args=suggestion-timeout:5000'
    );
  });

  test('should redirect to the specified url after submitting a query', async ({
    page,
    searchBox,
  }) => {
    await searchBox.searchInput.fill('kayak');
    await searchBox.submitButton.click();
    await page.waitForURL(
      '**/iframe.html?id=atomic-commerce-search-box--in-page*'
    );
    await expect(searchBox.searchInput).toHaveValue('kayak');
  });

  test('should redirect to the specified url after selecting a suggestion', async ({
    page,
    searchBox,
  }) => {
    await searchBox.searchInput.click();
    const suggestionText =
      (await searchBox.searchSuggestions().first().textContent()) ?? '';

    await searchBox.searchSuggestions().first().click();
    await page.waitForURL(
      '**/iframe.html?id=atomic-commerce-search-box--in-page*'
    );
    await expect(searchBox.searchInput).toHaveValue(suggestionText);
  });

  test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
    await searchBox.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
