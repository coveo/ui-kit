import type {MockInstance} from 'vitest';
import {
  PlatformClient,
  type PlatformClientCallError,
} from '../api/platform-client.js';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine.js';
import {
  buildCoreSearchBox,
  type SearchBoxOptions,
  type SearchBoxProps,
} from '../controllers/core/search-box/headless-core-search-box.js';
import {
  interfaceChange,
  interfaceLoad,
  logInterfaceChange,
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
  omniboxFromLink,
  searchFromLink,
} from '../features/analytics/analytics-actions.js';
import type {LegacySearchAction} from '../features/analytics/analytics-utils.js';
import {
  didYouMeanAutomatic,
  didYouMeanClick,
  logDidYouMeanAutomatic,
  logDidYouMeanClick,
} from '../features/did-you-mean/did-you-mean-analytics-actions.js';
import {registerCategoryFacet} from '../features/facets/category-facet-set/category-facet-set-actions.js';
import {
  categoryBreadcrumbFacet,
  logCategoryFacetBreadcrumb,
} from '../features/facets/category-facet-set/category-facet-set-analytics-actions.js';
import {categoryFacetSetReducer} from '../features/facets/category-facet-set/category-facet-set-slice.js';
import {
  breadcrumbFacet,
  facetClearAll,
  facetDeselect,
  facetExclude,
  facetSelect,
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
} from '../features/facets/facet-set/facet-set-analytics-actions.js';
import {logClearBreadcrumbs} from '../features/facets/generic/facet-generic-analytics-actions.js';
import {registerDateFacet} from '../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {
  dateBreadcrumbFacet,
  logDateFacetBreadcrumb,
} from '../features/facets/range-facets/date-facet-set/date-facet-analytics-actions.js';
import {dateFacetSetReducer} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {DateFacetValue} from '../features/facets/range-facets/date-facet-set/interfaces/response.js';
import type {NumericFacetValue} from '../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import {registerNumericFacet} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {
  logNumericFacetBreadcrumb,
  numericBreadcrumbFacet,
} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions.js';
import {numericFacetSetReducer} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {
  logInstantResultsSearch,
  searchboxAsYouType,
} from '../features/instant-results/instant-result-analytics-actions.js';
import {
  logSearchboxSubmit,
  searchboxSubmit,
} from '../features/query/query-analytics-actions.js';
import {fetchQuerySuggestions} from '../features/query-suggest/query-suggest-actions.js';
import type {OmniboxSuggestionMetadata} from '../features/query-suggest/query-suggest-analytics-actions.js';
import {logRecentQueryClick} from '../features/recent-queries/recent-queries-analytics-actions.js';
import {
  logRecommendationUpdate,
  recommendationInterfaceLoad,
} from '../features/recommendation/recommendation-analytics-actions.js';
import {
  executeSearch,
  fetchFacetValues,
} from '../features/search/search-actions.js';
import {
  logResultsSort,
  resultsSort,
} from '../features/sort-criteria/sort-criteria-analytics-actions.js';
import {clearMicrotaskQueue} from '../test/unit-test-utils.js';

const nextSearchEngine = buildSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {
      analyticsMode: 'next',
      trackingId: 'alex',
    },
  },
});

const legacySearchEngine = buildSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
  },
});

export function assertNextEqualsLegacy(
  call: MockInstance,
  excludedProperties: string[] = excludedBaseProperties
) {
  expect(extractAndExcludeProperties(call, 0, excludedProperties)).toEqual(
    extractAndExcludeProperties(call, 1, excludedProperties)
  );
}

export function assertActionCause(
  call: MockInstance,
  callIndex: number,
  expectedActionCause: string
) {
  expect(call).toHaveBeenNthCalledWith(
    callIndex,
    expect.objectContaining({
      requestParams: expect.objectContaining({
        analytics: expect.objectContaining({actionCause: expectedActionCause}),
      }),
    })
  );
}

export function extractAndExcludeProperties(
  call: MockInstance,
  callIndex: number,
  excludedProperties: string[]
): Record<string, unknown> {
  const {
    requestParams: {analytics = {} as Record<string, unknown>},
  } = call.mock.calls[callIndex][0] as {
    requestParams: {analytics?: Record<string, unknown>};
  };
  let result = analytics;
  result = excludeProperties(result, excludedProperties);
  return result;
}

function excludeProperties(
  obj: Record<string, unknown> | object,
  excludedKeys: string[]
) {
  const result = {...obj};
  excludedKeys.forEach((prop: string) => delete result[prop]);
  return result;
}

export const excludedBaseProperties = [
  'clientId',
  'capture',
  'clientTimestamp',
  'trackingId',
  'source',
  'customData',
  'documentReferrer',
  'documentLocation',
];

const ANY_FACET_VALUE = 'any facet value';
const ANY_FACET_ID = 'any facet id';
const ANY_RANGE_FACET_BREADCRUMB_VALUE: DateFacetValue = {
  start: 'start',
  end: 'end',
  endInclusive: true,
  state: 'idle',
  numberOfResults: 1,
};

const ANY_CATEGORY_FACET_PATH = ['any category facet path'];

describe('Analytics Search Migration', () => {
  type Procedure = (
    ...args: unknown[]
  ) => Promise<Response | PlatformClientCallError>;

  let callSpy: MockInstance<Procedure>;

  beforeEach(() => {
    callSpy = vi.spyOn(PlatformClient, 'call');
    callSpy.mockImplementation(() => Promise.resolve(new Response()));
  });

  afterEach(() => {
    callSpy.mockClear();
  });

  it('analytics/interface/load', async () => {
    const action = executeSearch({
      legacy: logInterfaceLoad(),
      next: interfaceLoad(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/select', async () => {
    const action = executeSearch({
      legacy: logFacetSelect({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetSelect(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/didyoumean/click', async () => {
    const action = executeSearch({
      legacy: logDidYouMeanClick(),
      next: didYouMeanClick(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/facet/deselect', async () => {
    const action = executeSearch({
      legacy: logFacetDeselect({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetDeselect(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });
  it('analytics/facet/deselectAllBreadcrumbs', async () => {
    const action = executeSearch({
      legacy: logClearBreadcrumbs(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/facet/exclude', async () => {
    const action = executeSearch({
      legacy: logFacetExclude({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetExclude(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/breadcrumb', async () => {
    const action = executeSearch({
      legacy: logFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: breadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/breadcrumb', async () => {
    const action = executeSearch({
      legacy: logFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: breadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/reset', async () => {
    const action = executeSearch({
      legacy: logFacetClearAll(ANY_FACET_ID),
      next: facetClearAll(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/reset', async () => {
    const action = executeSearch({
      legacy: logFacetClearAll(ANY_FACET_ID),
      next: facetClearAll(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/dateFacet/breadcrumb', async () => {
    legacySearchEngine.addReducers({
      dateFacetSet: dateFacetSetReducer,
    });
    nextSearchEngine.addReducers({
      dateFacetSet: dateFacetSetReducer,
    });
    legacySearchEngine.dispatch(
      registerDateFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    nextSearchEngine.dispatch(
      registerDateFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    const action = executeSearch({
      legacy: logDateFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        selection: ANY_RANGE_FACET_BREADCRUMB_VALUE,
      }),
      next: dateBreadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/numericFacet/breadcrumb', async () => {
    legacySearchEngine.addReducers({
      numericFacetSet: numericFacetSetReducer,
    });
    nextSearchEngine.addReducers({
      numericFacetSet: numericFacetSetReducer,
    });
    legacySearchEngine.dispatch(
      registerNumericFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    nextSearchEngine.dispatch(
      registerNumericFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    const action = executeSearch({
      legacy: logNumericFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        selection:
          ANY_RANGE_FACET_BREADCRUMB_VALUE as unknown as NumericFacetValue,
      }),
      next: numericBreadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/sort/results', async () => {
    const action = executeSearch({
      legacy: logResultsSort(),
      next: resultsSort(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/querySuggest', async () => {
    const options: SearchBoxOptions = {
      id: 'search-box-123',
      numberOfSuggestions: 10,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<a>',
          close: '<a>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '<i>',
        },
      },
    };
    const props: SearchBoxProps = {
      options,
      executeSearchActionCreator: executeSearch,
      fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
      isNextAnalyticsReady: true,
    };
    const nextSearchBox = buildCoreSearchBox(nextSearchEngine, props);
    const legacySearchBox = buildCoreSearchBox(legacySearchEngine, props);

    const value = 'i like this expression';
    nextSearchBox.selectSuggestion(value);
    legacySearchBox.selectSuggestion(value);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/categoryFacet/breadcrumb', async () => {
    legacySearchEngine.addReducers({
      categoryFacetSet: categoryFacetSetReducer,
    });
    nextSearchEngine.addReducers({
      categoryFacetSet: categoryFacetSetReducer,
    });
    legacySearchEngine.dispatch(
      registerCategoryFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
      })
    );
    nextSearchEngine.dispatch(
      registerCategoryFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
      })
    );
    const action = executeSearch({
      legacy: logCategoryFacetBreadcrumb({
        categoryFacetId: ANY_FACET_ID,
        categoryFacetPath: ANY_CATEGORY_FACET_PATH,
      }),
      next: categoryBreadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/dateFacet/breadcrumb', async () => {
    legacySearchEngine.addReducers({
      dateFacetSet: dateFacetSetReducer,
    });
    nextSearchEngine.addReducers({
      dateFacetSet: dateFacetSetReducer,
    });
    legacySearchEngine.dispatch(
      registerDateFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    nextSearchEngine.dispatch(
      registerDateFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    const action = executeSearch({
      legacy: logDateFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        selection: ANY_RANGE_FACET_BREADCRUMB_VALUE,
      }),
      next: dateBreadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/numericFacet/breadcrumb', async () => {
    legacySearchEngine.addReducers({
      numericFacetSet: numericFacetSetReducer,
    });
    nextSearchEngine.addReducers({
      numericFacetSet: numericFacetSetReducer,
    });
    legacySearchEngine.dispatch(
      registerNumericFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    nextSearchEngine.dispatch(
      registerNumericFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    const action = executeSearch({
      legacy: logNumericFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        selection:
          ANY_RANGE_FACET_BREADCRUMB_VALUE as unknown as NumericFacetValue,
      }),
      next: numericBreadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/sort/results', async () => {
    const action = executeSearch({
      legacy: logResultsSort(),
      next: resultsSort(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/querySuggest', async () => {
    const options: SearchBoxOptions = {
      id: 'search-box-123',
      numberOfSuggestions: 10,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<a>',
          close: '<a>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '<i>',
        },
      },
    };
    const props: SearchBoxProps = {
      options,
      executeSearchActionCreator: executeSearch,
      fetchQuerySuggestionsActionCreator: fetchQuerySuggestions,
      isNextAnalyticsReady: true,
    };
    const nextSearchBox = buildCoreSearchBox(nextSearchEngine, props);
    const legacySearchBox = buildCoreSearchBox(legacySearchEngine, props);

    const value = 'i like this expression';
    nextSearchBox.selectSuggestion(value);
    legacySearchBox.selectSuggestion(value);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/categoryFacet/breadcrumb', async () => {
    legacySearchEngine.addReducers({
      categoryFacetSet: categoryFacetSetReducer,
    });
    nextSearchEngine.addReducers({
      categoryFacetSet: categoryFacetSetReducer,
    });
    legacySearchEngine.dispatch(
      registerCategoryFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
      })
    );
    nextSearchEngine.dispatch(
      registerCategoryFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
      })
    );
    const action = executeSearch({
      legacy: logCategoryFacetBreadcrumb({
        categoryFacetId: ANY_FACET_ID,
        categoryFacetPath: ANY_CATEGORY_FACET_PATH,
      }),
      next: categoryBreadcrumbFacet(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/recentQueries/click', async () => {
    const action = executeSearch({
      legacy: logRecentQueryClick(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/interface/change', async () => {
    const action = executeSearch({
      legacy: logInterfaceChange(),
      next: interfaceChange(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/searchFromLink', async () => {
    const action = executeSearch({
      legacy: logSearchFromLink(),
      next: searchFromLink(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/omniboxFromLink', async () => {
    const metadata: OmniboxSuggestionMetadata = {
      suggestionRanking: 1,
      partialQuery: 'partialQuery',
      partialQueries: 'partialQueries',
      suggestions: 'suggestions',
      querySuggestResponseId: 'querySuggestResponseId',
    };

    const action = executeSearch({
      legacy: logOmniboxFromLink(metadata),
      next: omniboxFromLink(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/change', async () => {
    const action = executeSearch({
      legacy: logInterfaceChange(),
      next: interfaceChange(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/searchFromLink', async () => {
    const action = executeSearch({
      legacy: logSearchFromLink(),
      next: searchFromLink(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/omniboxFromLink', async () => {
    const metadata: OmniboxSuggestionMetadata = {
      suggestionRanking: 1,
      partialQuery: 'partialQuery',
      partialQueries: 'partialQueries',
      suggestions: 'suggestions',
      querySuggestResponseId: 'querySuggestResponseId',
    };

    const action = executeSearch({
      legacy: logOmniboxFromLink(metadata),
      next: omniboxFromLink(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/didyoumean/automatic', async () => {
    const action = executeSearch({
      legacy: logDidYouMeanAutomatic(),
      next: didYouMeanAutomatic(),
    });
    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/instantResult/searchboxAsYouType', async () => {
    const action = executeSearch({
      legacy: logInstantResultsSearch() as LegacySearchAction,
      next: searchboxAsYouType(),
    });
    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });
  it('analytics/searchbox/submit', async () => {
    const action = executeSearch({
      legacy: logSearchboxSubmit(),
      next: searchboxSubmit(),
    });
    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/recommendation/update', async () => {
    const action = executeSearch({
      legacy: logRecommendationUpdate(),
      next: recommendationInterfaceLoad(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/showMore', async () => {
    const action = fetchFacetValues({
      legacy: logFacetShowMore(ANY_FACET_ID),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/facet/showLess', async () => {
    const action = fetchFacetValues({
      legacy: logFacetShowLess(ANY_FACET_ID),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });
});
