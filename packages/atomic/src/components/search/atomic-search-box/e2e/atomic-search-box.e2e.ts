import {PactV3, MatchersV3} from '@pact-foundation/pact';
import {resolve} from 'node:path';
import {test, expect} from './fixture';

// Create a 'pact' between the two applications in the integration we are testing
const provider = new PactV3({
  dir: resolve(process.cwd(), 'pacts'),
  consumer: 'Atomic',
  provider: 'SearchUI',
});

const querySuggestModelFactory = (count: number) => ({
  completions: MatchersV3.constrainedArrayLike(
    {
      expression: MatchersV3.string('suede'),
      score: MatchersV3.number(),
      highlighted: MatchersV3.string('[suede]'),
      executableConfidence: 1.0,
      objectId: MatchersV3.uuid(),
    },
    0,
    count,
    count
  ),
  responseId: MatchersV3.uuid(),
});

const iso8601Matcher = MatchersV3.timestamp(
  "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  '2021-01-01T00:00:00.000Z'
);

const actionHistoryQueryMatcher = {
  name: 'Query',
  time: iso8601Matcher,
  value: MatchersV3.string(),
};

const actionHistoryPageViewMatcher = {
  name: 'PageView',
  time: iso8601Matcher,
  value: MatchersV3.string(),
};

const actionsHistoryMatchers = MatchersV3.eachLike(
  [actionHistoryQueryMatcher, actionHistoryPageViewMatcher],
  0
);

const analyticsMatcher = {
  clientId: MatchersV3.uuid('7e1ca7a0-b049-45cd-8f25-54bbb6722ea7'),
  clientTimestamp: iso8601Matcher,
  documentReferrer: MatchersV3.string(),
  documentLocation: MatchersV3.url2(
    'http://localhost:4400/iframe.html?args=&id=atomic-search-box--default&viewMode=story',
    []
  ),
  originContext: 'Search',
  capture: true,
  source: MatchersV3.arrayContaining(
    MatchersV3.regex(/@coveo\/atomic@\d+.\d+.\d+/, '@coveo/atomic@3.2.1'),
    MatchersV3.regex(/@coveo\/headless@\d+.\d+.\d+/, '@coveo/headless@3.1.1')
  ),
};

const querySuggestQueryBodyMatcher = {
  actionsHistory: actionsHistoryMatchers,
  analytics: analyticsMatcher,
  q: '',
  count: 8,
  locale: MatchersV3.string('en'),
  visitorId: MatchersV3.uuid(),
  timezone: MatchersV3.string('America/Toronto'),
  tab: MatchersV3.string('default'),
  searchHub: MatchersV3.string('default'),
};

test.describe('default', () => {
  let pactCloser: Promise<void>;
  let pactProvider: Promise<void>;
  let closeProvider: () => void;
  test.beforeEach(async ({searchBox}) => {
    provider
      .given('A healthy organization')
      .uponReceiving(
        'a request for 8 query suggestions without a specific query'
      )
      .withRequest({
        method: 'OPTIONS',
        path: '/querySuggest',
        query: {
          organizationId: MatchersV3.string(),
        },
      })
      .willRespondWith({
        status: 200,
      })
      .withRequest({
        method: 'POST',
        path: '/querySuggest',
        query: {
          organizationId: MatchersV3.string(),
        },
        body: querySuggestQueryBodyMatcher,
      })
      .willRespondWith({
        status: 200,
        headers: {'Content-Type': 'application/json'},
        body: querySuggestModelFactory(8),
      });
    pactCloser = new Promise((resolve) => {
      closeProvider = resolve;
    });
    pactProvider = provider.executeTest(async (mockServer) => {
      console.log('mockServer.url', mockServer.url);
      await searchBox.load({
        args: {suggestionTimeout: 5000},
        queryParams: {searchProxyUrl: encodeURIComponent(mockServer.url)},
      });
      await pactCloser;
    });
  });

  test.afterEach(async () => {
    closeProvider();
    await pactProvider;
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

    test.only('should display suggested queries', async ({searchBox}) => {
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

    test('should be A11y compliant', async ({searchBox, makeAxeBuilder}) => {
      await searchBox.hydrated.waitFor();
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations).toEqual([]);
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
