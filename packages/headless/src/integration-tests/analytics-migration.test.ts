import {SearchAnalyticsProvider} from '../api/analytics/search-analytics';
import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine';
import {
  SearchBoxOptions,
  SearchBoxProps,
  buildCoreSearchBox,
} from '../controllers/core/search-box/headless-core-search-box';
import {
  interfaceChange,
  interfaceLoad,
  logInterfaceChange,
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
  omniboxFromLink,
  searchFromLink,
} from '../features/analytics/analytics-actions';
import {SearchPageEvents} from '../features/analytics/search-action-cause';
import {
  didYouMeanClick,
  logDidYouMeanClick,
} from '../features/did-you-mean/did-you-mean-analytics-actions';
import {registerCategoryFacet} from '../features/facets/category-facet-set/category-facet-set-actions';
import {logCategoryFacetBreadcrumb} from '../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {categoryFacetSetReducer} from '../features/facets/category-facet-set/category-facet-set-slice';
import {
  breadcrumbFacet,
  facetClearAll,
  facetDeselect,
  facetExclude,
  facetSelect,
  facetUpdateSort,
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUpdateSort,
} from '../features/facets/facet-set/facet-set-analytics-actions';
import {FacetSortCriterion} from '../features/facets/facet-set/interfaces/request';
import {
  breadcrumbResetAll,
  logClearBreadcrumbs,
} from '../features/facets/generic/facet-generic-analytics-actions';
import {registerDateFacet} from '../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  dateBreadcrumbFacet,
  logDateFacetBreadcrumb,
} from '../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {dateFacetSetReducer} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetValue} from '../features/facets/range-facets/date-facet-set/interfaces/response';
import {NumericFacetValue} from '../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {registerNumericFacet} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {
  logNumericFacetBreadcrumb,
  numericBreadcrumbFacet,
} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {numericFacetSetReducer} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {
  logNavigateBackward,
  logNavigateForward,
  logNoResultsBack,
  navigateBackward,
  navigateForward,
  noResultsBack,
} from '../features/history/history-analytics-actions';
import {fetchQuerySuggestions} from '../features/query-suggest/query-suggest-actions';
import {OmniboxSuggestionMetadata} from '../features/query-suggest/query-suggest-analytics-actions';
import {logRecentQueryClick} from '../features/recent-queries/recent-queries-analytics-actions';
import {executeSearch} from '../features/search/search-actions';
import {
  logResultsSort,
  resultsSort,
} from '../features/sort-criteria/sort-criteria-analytics-actions';
import {
  StaticFilterValueMetadata,
  logStaticFilterClearAll,
  logStaticFilterDeselect,
  logStaticFilterSelect,
  staticFilterClearAll,
  staticFilterDeselect,
  staticFilterSelect,
} from '../features/static-filter-set/static-filter-set-actions';
import {logUndoTriggerQuery} from '../features/triggers/trigger-analytics-actions';

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

function assertNextEqualsLegacy(call: jest.SpyInstance) {
  expect(extractAndExcludeProperties(call, 0)).toEqual(
    extractAndExcludeProperties(call, 1)
  );
}

function extractAndExcludeProperties(
  call: jest.SpyInstance,
  callIndex: number
): Record<string, unknown> {
  const {
    requestParams: {analytics = {} as Record<string, unknown>},
  } = call.mock.calls[callIndex][0] as {
    requestParams: {analytics?: Record<string, unknown>};
  };

  return excludeProperties(analytics);
}

async function wait() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function excludeProperties(obj: Record<string, unknown>) {
  const result = {...obj};
  excludedBaseProperties.forEach((prop: string) => delete result[prop]);

  return result;
}

const excludedBaseProperties = [
  'clientId',
  'capture',
  'clientTimestamp',
  'trackingId',
];

const ANY_FACET_VALUE = 'any facet value';
const ANY_FACET_ID = 'any facet id';
const ANY_CRITERION: FacetSortCriterion = 'alphanumeric';
const ANY_RANGE_FACET_BREADCRUMB_VALUE: DateFacetValue = {
  start: 'start',
  end: 'end',
  endInclusive: true,
  state: 'idle',
  numberOfResults: 1,
};
const ANY_STATIC_FILTER_ID = 'any static filter id';
const ANY_STATIC_FILTER_VALUE: StaticFilterValueMetadata = {
  caption: 'any static filter value caption',
  expression: 'any static filter value expression',
};
const ANY_QUERY = 'any query';
const ANY_CATEGORY_FACET_PATH = ['any category facet path'];

describe('Analytics Search Migration', () => {
  let callSpy: jest.SpyInstance<Promise<Response | PlatformClientCallError>>;

  beforeEach(() => {
    callSpy = jest.spyOn(PlatformClient, 'call');
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
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/select', async () => {
    const action = executeSearch({
      legacy: logFacetSelect({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetSelect(ANY_FACET_ID, ANY_FACET_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/didyoumean/click', async () => {
    const action = executeSearch({
      legacy: logDidYouMeanClick(),
      next: didYouMeanClick(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/deselect', async () => {
    const action = executeSearch({
      legacy: logFacetDeselect({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetDeselect(ANY_FACET_ID, ANY_FACET_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });
  it('analytics/facet/deselectAllBreadcrumbs', async () => {
    const action = executeSearch({
      legacy: logClearBreadcrumbs(),
      next: breadcrumbResetAll(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/exclude', async () => {
    const action = executeSearch({
      legacy: logFacetExclude({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetExclude(ANY_FACET_ID, ANY_FACET_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/sortChange', async () => {
    const action = executeSearch({
      legacy: logFacetUpdateSort({
        facetId: ANY_FACET_ID,
        criterion: ANY_CRITERION,
      }),
      next: facetUpdateSort(ANY_FACET_ID, ANY_CRITERION),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('history/analytics/forward', async () => {
    const action = executeSearch({
      legacy: logNavigateForward(),
      next: navigateForward(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/breadcrumb', async () => {
    const action = executeSearch({
      legacy: logFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: breadcrumbFacet(ANY_FACET_ID, ANY_FACET_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('history/analytics/backward', async () => {
    const action = executeSearch({
      legacy: logNavigateBackward(),
      next: navigateBackward(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/reset', async () => {
    const action = executeSearch({
      legacy: logFacetClearAll(ANY_FACET_ID),
      next: facetClearAll(ANY_FACET_ID),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('history/analytics/noresultsback', async () => {
    const action = executeSearch({
      legacy: logNoResultsBack(),
      next: noResultsBack(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

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
      next: dateBreadcrumbFacet(ANY_FACET_ID, ANY_RANGE_FACET_BREADCRUMB_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

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
      next: numericBreadcrumbFacet(
        ANY_FACET_ID,
        ANY_RANGE_FACET_BREADCRUMB_VALUE as unknown as NumericFacetValue
      ),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/sort/results', async () => {
    const action = executeSearch({
      legacy: logResultsSort(),
      next: resultsSort(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

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
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/staticFilter/select', async () => {
    const action = executeSearch({
      legacy: logStaticFilterSelect({
        staticFilterId: ANY_STATIC_FILTER_ID,
        staticFilterValue: ANY_STATIC_FILTER_VALUE,
      }),
      next: staticFilterSelect(ANY_STATIC_FILTER_ID, ANY_STATIC_FILTER_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/staticFilter/deselect', async () => {
    const action = executeSearch({
      legacy: logStaticFilterDeselect({
        staticFilterId: ANY_STATIC_FILTER_ID,
        staticFilterValue: ANY_STATIC_FILTER_VALUE,
      }),
      next: staticFilterDeselect(ANY_STATIC_FILTER_ID, ANY_STATIC_FILTER_VALUE),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/staticFilter/clearAll', async () => {
    const action = executeSearch({
      legacy: logStaticFilterClearAll({
        staticFilterId: ANY_STATIC_FILTER_ID,
      }),
      next: staticFilterClearAll(ANY_STATIC_FILTER_ID),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/trigger/query/undo', async () => {
    const action = executeSearch({
      legacy: logUndoTriggerQuery({
        undoneQuery: ANY_QUERY,
      }),
      next: {
        actionCause: SearchPageEvents.undoTriggerQuery,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getUndoTriggerQueryMetadata(
            ANY_QUERY
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

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
      next: {
        actionCause: SearchPageEvents.breadcrumbFacet,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(
            () => state
          ).getCategoryFacetBreadcrumbMetadata(
            ANY_FACET_ID,
            ANY_CATEGORY_FACET_PATH
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/recentQueries/click', async () => {
    const action = executeSearch({
      legacy: logRecentQueryClick(),
      next: {
        actionCause: SearchPageEvents.recentQueryClick,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/change', async () => {
    const action = executeSearch({
      legacy: logInterfaceChange(),
      next: interfaceChange(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/searchFromLink', async () => {
    const action = executeSearch({
      legacy: logSearchFromLink(),
      next: searchFromLink(),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

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
      next: omniboxFromLink(metadata),
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });
});
