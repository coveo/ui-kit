import {expect, test} from './fixture';

test.describe('atomic-commerce-search-box', () => {
  test.describe('default', () => {
    test.beforeEach(async ({searchBox}) => {
      await searchBox.load({args: {suggestionTimeout: 5000}});
    });

    test('should have an enabled search button', async ({searchBox}) => {
      await expect(searchBox.submitButton).toBeEnabled();
    });

    test.describe('when suggestions are available', () => {
      test.beforeEach(async ({searchBox}) => {
        await searchBox.load({story: 'with-suggestions'});
        await searchBox.searchInput.waitFor({state: 'visible'});
        await searchBox.searchInput.click();
      });

      test('should display suggested queries', async ({searchBox}) => {
        await expect(searchBox.searchSuggestions().first()).toBeVisible();
      });

      test('should update aria-live message', async ({searchBox}) => {
        await searchBox.searchSuggestions().first().waitFor({state: 'visible'});
        const count = await searchBox.searchSuggestions().count();
        const regexMessage = new RegExp(
          `${count} search suggestion(s are)? available.`
        );

        expect(
          (await searchBox.ariaLive.filter({hasText: regexMessage}).count()) ===
            1
        ).toBe(true);
      });

      test.describe('after clicking a suggestion', () => {
        let suggestionText: string = '';

        test.beforeEach(async ({searchBox}) => {
          await expect(searchBox.searchSuggestions().first()).toBeVisible();

          suggestionText =
            (await searchBox.searchSuggestions().last().textContent()) ?? '';
          await searchBox.searchSuggestions().last().click();
        });

        test('should update the searchbox input', async ({searchBox}) => {
          await expect(searchBox.searchInput).toHaveValue(
            suggestionText.trim()
          );
        });

        test('should collapse the suggested queries', async ({searchBox}) => {
          await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
        });
      });

      test.describe('after focusing a suggestion', () => {
        let suggestionText: string;

        test.beforeEach(async ({searchBox}) => {
          await expect(searchBox.searchSuggestions().first()).toBeVisible();

          suggestionText =
            (await searchBox.searchSuggestions().first().textContent()) ?? '';
          await searchBox.searchInput.press('ArrowDown');
        });

        test('should update the searchbox input', async ({searchBox}) => {
          await expect(searchBox.searchInput).toHaveValue(
            suggestionText.trim()
          );
        });

        test.describe('after pressing Enter', () => {
          test.beforeEach(async ({searchBox}) => {
            await searchBox.searchInput.press('Enter');
          });

          test('should collapse the suggested queries', async ({searchBox}) => {
            await expect(
              searchBox.searchSuggestions().first()
            ).not.toBeVisible();
          });
        });
      });
    });

    test.describe('when no suggestions are available', () => {
      test.beforeEach(async ({searchBox}) => {
        await searchBox.load({story: 'with-no-suggestions'});
        await searchBox.searchInput.click();
      });

      test('should not display suggested queries', async ({searchBox}) => {
        await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
      });

      test('should update aria-live message', async ({searchBox}) => {
        await expect(searchBox.ariaLive).toHaveText(
          'There are no search suggestions.'
        );
      });
    });

    test.describe('when recent queries are available', () => {
      test.beforeEach(async ({searchBox, page}) => {
        await searchBox.load({story: 'with-suggestions-and-recent-queries'});
        // We reload to ensure we load the recent queries from local storage
        await page.reload();
        await searchBox.hydrated.waitFor();
        await searchBox.searchInput.waitFor({state: 'visible'});
        await searchBox.searchInput.click();
      });

      test('should display recent queries', async ({searchBox}) => {
        await expect(searchBox.recentQueries().first()).toBeVisible();
      });

      test('should update aria-live message', async ({searchBox}) => {
        await searchBox.recentQueries().first().waitFor({state: 'visible'});
        const count = Math.min(
          (await searchBox.recentQueries().count()) +
            (await searchBox.searchSuggestions().count()),
          parseInt((await searchBox.numberOfQueries) ?? '')
        ).toString();

        const regexMessage = new RegExp(
          `${count} search suggestion(s)? are available.`
        );

        expect(
          (await searchBox.ariaLive.filter({hasText: regexMessage}).count()) ===
            1
        ).toBe(true);
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

        test('should clear search-box when clicking the clear button', async ({
          searchBox,
        }) => {
          await searchBox.clearButton.click();
          await expect(searchBox.searchInput).toHaveText('');
          await expect(searchBox.clearButton).not.toBeVisible();
        });
      });

      test.describe('after clicking the submit button', () => {
        test.beforeEach(async ({searchBox}) => {
          await searchBox
            .searchSuggestions()
            .first()
            .waitFor({state: 'visible', timeout: 10e4});
          await searchBox.submitButton.click();
        });

        test('should collapse the suggested queries', async ({searchBox}) => {
          await expect(searchBox.searchSuggestions().first()).not.toBeVisible();
        });
      });
    });
  });

  test.describe('with instant products & query suggestions', () => {
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
        await searchBox.searchInput.fill('kayak');
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
          searchBox.instantProduct({listSide: 'Right'}).first()
        ).toBeVisible();
      });

      test('should display in the search box what has been submitted', async ({
        searchBox,
      }) => {
        await searchBox.searchInput.fill('surf');
        await searchBox.searchInput.press('Enter');
        await expect(searchBox.searchInput).toHaveValue('surf');
      });

      test.describe('after focusing on suggestion with the mouse', () => {
        test('should submit what is in the search box regardless of the mouse position', async ({
          searchBox,
        }) => {
          await searchBox.searchInput.fill('surf');
          await searchBox.searchSuggestions({listSide: 'Left'}).first().hover();
          await searchBox.searchInput.press('Enter');
          await expect(searchBox.searchInput).toHaveValue('surf');
        });
      });
    });

    test.describe('when hovering a instant result and pressing Enter', () => {
      test('should execute the query in the search box', async ({
        searchBox,
      }) => {
        await searchBox.searchInput.click();
        await searchBox.searchInput.fill('a');
        await searchBox.instantProduct({listSide: 'Right'}).first().hover();
        await searchBox.searchInput.press('Enter');
        await expect(searchBox.searchInput).toHaveValue('a');
      });
    });
  });

  test.describe('with disable-search=true and minimum-query-length=1', () => {
    let querySuggestionRequestPerformed = false;

    test.beforeEach(async ({page, searchBox}) => {
      querySuggestionRequestPerformed = false;
      page.on('request', (request) => {
        if (request.url().includes('/querySuggest')) {
          querySuggestionRequestPerformed = true;
        }
      });
      await searchBox.load({
        args: {
          disableSearch: true,
          minimumQueryLength: 1,
          suggestionTimeout: 5000,
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

      test('should not perform requests against the query suggest endpoint', () => {
        expect(querySuggestionRequestPerformed).toBe(false);
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
    let querySuggestionRequestPerformed = false;
    test.beforeEach(async ({page, searchBox}) => {
      querySuggestionRequestPerformed = false;
      page.on('request', (request) => {
        if (request.url().includes('/querySuggest')) {
          querySuggestionRequestPerformed = true;
        }
      });
      await searchBox.load({
        args: {minimumQueryLength: 4, suggestionTimeout: 5000},
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

      test('the submit button is enabled', async ({searchBox}) => {
        await expect(searchBox.submitButton).toBeEnabled();
      });

      test('there are search suggestions', async ({searchBox}) => {
        await expect(searchBox.searchSuggestions().first()).toBeVisible();
      });

      test('should perform requests against the query suggest endpoint', async () => {
        await expect.poll(() => querySuggestionRequestPerformed).toBe(true);
      });
    });
  });
});
