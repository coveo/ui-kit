import {SearchAnalyticsProvider} from '../api/analytics/search-analytics';
import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {SearchPageEvents} from '../features/analytics/search-action-cause';
import {logCategoryFacetBreadcrumb} from '../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUpdateSort,
} from '../features/facets/facet-set/facet-set-analytics-actions';
import {FacetSortCriterion} from '../features/facets/facet-set/interfaces/request';
import {logDateFacetBreadcrumb} from '../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {DateFacetValue} from '../features/facets/range-facets/date-facet-set/interfaces/response';
import {NumericFacetValue} from '../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {logNumericFacetBreadcrumb} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {executeSearch} from '../features/search/search-actions';
import {logResultsSort} from '../features/sort-criteria/sort-criteria-analytics-actions';
import {
  StaticFilterValueMetadata,
  logStaticFilterClearAll,
  logStaticFilterDeselect,
  logStaticFilterSelect,
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
      next: {
        actionCause: SearchPageEvents.interfaceLoad,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
      },
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
      next: {
        actionCause: SearchPageEvents.facetSelect,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getFacetMetadata(
            ANY_FACET_ID,
            ANY_FACET_VALUE
          ),
      },
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
      next: {
        actionCause: SearchPageEvents.facetDeselect,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getFacetMetadata(
            ANY_FACET_ID,
            ANY_FACET_VALUE
          ),
      },
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
      next: {
        actionCause: SearchPageEvents.facetExclude,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getFacetMetadata(
            ANY_FACET_ID,
            ANY_FACET_VALUE
          ),
      },
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
      next: {
        actionCause: SearchPageEvents.facetUpdateSort,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getFacetSortMetadata(
            ANY_FACET_ID,
            ANY_CRITERION
          ),
      },
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
      next: {
        actionCause: SearchPageEvents.breadcrumbFacet,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getFacetMetadata(
            ANY_FACET_ID,
            ANY_FACET_VALUE
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/reset', async () => {
    const action = executeSearch({
      legacy: logFacetClearAll(ANY_FACET_ID),
      next: {
        actionCause: SearchPageEvents.facetClearAll,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getFacetClearAllMetadata(
            ANY_FACET_ID
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/dateFacet/breadcrumb', async () => {
    const action = executeSearch({
      legacy: logDateFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        selection: ANY_RANGE_FACET_BREADCRUMB_VALUE,
      }),
      next: {
        actionCause: SearchPageEvents.breadcrumbFacet,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(
            () => state
          ).getRangeFacetBreadcrumbMetadata(
            ANY_FACET_ID,
            ANY_RANGE_FACET_BREADCRUMB_VALUE
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/numericFacet/breadcrumb', async () => {
    const action = executeSearch({
      legacy: logNumericFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        selection:
          ANY_RANGE_FACET_BREADCRUMB_VALUE as unknown as NumericFacetValue,
      }),
      next: {
        actionCause: SearchPageEvents.breadcrumbFacet,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(
            () => state
          ).getRangeFacetBreadcrumbMetadata(
            ANY_FACET_ID,
            ANY_RANGE_FACET_BREADCRUMB_VALUE
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/sort/results', async () => {
    const action = executeSearch({
      legacy: logResultsSort(),
      next: {
        actionCause: SearchPageEvents.resultsSort,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getResultSortMetadata(),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  // it('analytics/querySuggest', async () => {
  //   nextSearchEngine.addReducers({
  //     querySuggestReducer,
  //   });
  //   legacySearchEngine.addReducers({
  //     querySuggestReducer,
  //   });

  //   nextSearchEngine.state.querySuggest = {} as Record<
  //     string,
  //     QuerySuggestState
  //   >;

  //   legacySearchEngine.state.querySuggest = {} as Record<
  //     string,
  //     QuerySuggestState
  //   >;

  //   nextSearchEngine.state.querySuggest['sd'] = {
  //     id: 'sd',
  //     completions: [],
  //     responseId: 'sd',
  //     partialQueries: [],
  //     count: 3,
  //     currentRequestId: 'sd',
  //     error: null,
  //     isLoading: false,
  //   };

  //   legacySearchEngine.state.querySuggest['sd'] = {
  //     id: 'sd',
  //     completions: [],
  //     responseId: 'sd',
  //     partialQueries: [],
  //     count: 3,
  //     currentRequestId: 'sd',
  //     error: null,
  //     isLoading: false,
  //   };
  //   const action = executeSearch({
  //     legacy: logQuerySuggestionClick({id: 'sd', suggestion: 'Sd'}),
  //     next: {
  //       actionCause: SearchPageEvents.omniboxAnalytics,
  //       getEventExtraPayload: (state) =>
  //         new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  //     },
  //   });

  //   legacySearchEngine.dispatch(action);
  //   nextSearchEngine.dispatch(action);
  //   await wait();

  //   assertNextEqualsLegacy(callSpy);
  // });

  it('analytics/staticFilter/select', async () => {
    const action = executeSearch({
      legacy: logStaticFilterSelect({
        staticFilterId: ANY_STATIC_FILTER_ID,
        staticFilterValue: ANY_STATIC_FILTER_VALUE,
      }),
      next: {
        actionCause: SearchPageEvents.staticFilterSelect,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(
            () => state
          ).getStaticFilterToggleMetadata(
            ANY_STATIC_FILTER_ID,
            ANY_STATIC_FILTER_VALUE
          ),
      },
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
      next: {
        actionCause: SearchPageEvents.staticFilterDeselect,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(
            () => state
          ).getStaticFilterToggleMetadata(
            ANY_STATIC_FILTER_ID,
            ANY_STATIC_FILTER_VALUE
          ),
      },
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
      next: {
        actionCause: SearchPageEvents.staticFilterClearAll,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(
            () => state
          ).getStaticFilterClearAllMetadata(ANY_STATIC_FILTER_ID),
      },
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
});
