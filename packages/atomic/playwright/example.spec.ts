import {Components} from '@coveo/atomic';
import {test, expect} from '@playwright/test';

export type TagProps = Record<string, string | number>;

type AriaLabelGenerator =
  Components.AtomicSearchBoxInstantResults['ariaLabelGenerator'];
export interface AddSearchBoxOptions {
  suggestions?: {maxWithoutQuery: number; maxWithQuery: number};
  recentQueries?: {maxWithoutQuery: number; maxWithQuery: number};
  instantResults?: {
    template?: HTMLElement;
    ariaLabelGenerator?: AriaLabelGenerator;
  };
  props?: TagProps;
}

const addElementToSearchPage = () => {
  const searchBoxComponent = 'atomic-search-box';

  const generateComponentHTML = (tag: string, props: TagProps = {}) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      e.setAttribute(k, v.toString());
    }
    return e;
  };
  const addSearchBox = (options: AddSearchBoxOptions = {}) => {
    const searchBox = generateComponentHTML(
      searchBoxComponent,
      options?.props ?? {}
    );
    if (options?.suggestions !== undefined) {
      searchBox.appendChild(
        generateComponentHTML('atomic-search-box-query-suggestions', {
          'max-without-query': options.suggestions.maxWithoutQuery,
          'max-with-query': options.suggestions.maxWithQuery,
        })
      );
    }
    if (options?.recentQueries !== undefined) {
      searchBox.appendChild(
        generateComponentHTML('atomic-search-box-recent-queries', {
          'max-without-query': options.recentQueries.maxWithoutQuery,
          'max-with-query': options.recentQueries.maxWithQuery,
        })
      );
    }
    if (options?.instantResults !== undefined) {
      const instantResultsElement = document.createElement(
        'atomic-search-box-instant-results'
      );
      if (options.instantResults.template) {
        instantResultsElement.appendChild(options.instantResults.template);
      }
      if (options.instantResults.ariaLabelGenerator) {
        instantResultsElement.ariaLabelGenerator =
          options.instantResults.ariaLabelGenerator;
      }
      searchBox.appendChild(instantResultsElement);
    }
    return searchBox;
  };
  const sbOpts = {
    recentQueries: {
      maxWithoutQuery: 3,
      maxWithQuery: 4,
    },
    instantResults: {},
    props: {
      'number-of-queries': 4,
      'suggestion-timeout': 2000,
    },
  };
  document
    .querySelector('atomic-search-interface')!
    .append(addSearchBox(sbOpts));
};

function buildMockRaw(config = {}) {
  return {
    urihash: '',
    parents: '',
    sfid: '',
    sfparentid: '',
    sfinsertedbyid: '',
    documenttype: '',
    sfcreatedbyid: '',
    permanentid: '',
    date: 0,
    objecttype: '',
    sourcetype: '',
    sftitle: '',
    size: 0,
    sffeeditemid: '',
    clickableuri: '',
    sfcreatedby: '',
    source: '',
    collection: '',
    connectortype: '',
    filetype: '',
    sfcreatedbyname: '',
    sflikecount: 0,
    language: [],
    ...config,
  };
}
function buildMockResult(config = {}) {
  return {
    title: '',
    uri: '',
    printableUri: '',
    clickUri: '',
    uniqueId: '',
    excerpt: '',
    firstSentences: '',
    summary: null,
    flags: '',
    hasHtmlVersion: false,
    score: 0,
    percentScore: 0,
    rankingInfo: null,
    isTopResult: false,
    isRecommendation: false,
    titleHighlights: [],
    firstSentencesHighlights: [],
    excerptHighlights: [],
    printableUriHighlights: [],
    summaryHighlights: [],
    absentTerms: [],
    raw: buildMockRaw(),
    ...config,
  };
}

test('when navigating from query to results', async ({page}) => {
  await page.goto('http://localhost:3333/playwright.html');
  page.getByTestId('search').innerHTML();
  await page.route('**/rest/search/v2?*', async (route) => {
    const response = await route.fetch();
    const json = {
      ...(await response.json()),
      results: Array.from({length: 4}, (_, i) =>
        buildMockResult({
          title: `Instant Result ${i}`,
          uniqueId: `instant_result_${i}`,
          uri: `https://example.com/${i}`,
          clickUri: `https://example.com/${i}`,
        })
      ),
    };
    await route.fulfill({response, json});
  });
  await page.evaluate(() => {
    localStorage.setItem(
      'coveo-recent-queries',
      JSON.stringify(Array.from({length: 4}, (_, i) => `Recent query ${i}`))
    );
  });
  await page.evaluate(addElementToSearchPage);
  await page.addScriptTag({
    content: `
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface = document.querySelector('atomic-search-interface');

    // Initialization
    await searchInterface.initialize({
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId: 'searchuisamples',
      organizationEndpoints: await searchInterface.getOrganizationEndpoints('searchuisamples'),
    });

    searchInterface.executeFirstSearch();

    searchInterface.i18n.addResourceBundle('en', 'caption-filetype', {
      '.html': 'html',
    });
  `,
    type: 'module',
  });
  //
  const zeSearchBoxEuh = page.getByPlaceholder('Search');
  await zeSearchBoxEuh.waitFor({state: 'visible'});
  await zeSearchBoxEuh.press('ArrowRight', {delay: 400});
  await zeSearchBoxEuh.press('ArrowRight', {delay: 400});
  await expect(page.getByLabel(/“Recent query .* In Left list./)).toHaveCount(
    3
  );
  await expect(page.getByLabel(/Instant Result .* In Right list./)).toHaveCount(
    4
  );
  const ariaStatuses = page.getByRole('status');
  await expect(ariaStatuses).toHaveCount(2);
  await expect(
    ariaStatuses.filter({
      hasText:
        'Instant Result 0, instant result. Button. 1 of 5. In Right list.',
    })
  ).toHaveAttribute('aria-live', 'assertive');
  await expect(
    ariaStatuses.filter({hasText: '3 search suggestions are available.'})
  ).toHaveAttribute('aria-live', 'polite');
  const selectedResult = page.getByLabel(
    'Instant Result 0, instant result. Button. 1 of 5. In Right list.'
  );
  await expect(selectedResult).toHaveAttribute(
    'part',
    /(^|\s)active-suggestion(\s|$)/
  );
  await expect(selectedResult).toHaveAttribute(
    'class',
    /(^|\s)bg-neutral-light(\s|$)/
  );
});
