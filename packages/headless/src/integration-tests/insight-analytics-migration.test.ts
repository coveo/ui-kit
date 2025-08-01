import type {MockInstance} from 'vitest';
import {
  PlatformClient,
  type PlatformClientCallError,
} from '../api/platform-client.js';
import {getSampleEngineConfiguration} from '../app/engine-configuration.js';
import {
  buildInsightEngine,
  type InsightEngineConfiguration,
} from '../app/insight-engine/insight-engine.js';
import type {NumericFacetValue} from '../controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
import {
  interfaceChange,
  interfaceLoad,
} from '../features/analytics/analytics-actions.js';
import {didYouMeanClick} from '../features/did-you-mean/did-you-mean-analytics-actions.js';
import {logDidYouMeanClick} from '../features/did-you-mean/did-you-mean-insight-analytics-actions.js';
import {registerCategoryFacet} from '../features/facets/category-facet-set/category-facet-set-actions.js';
import {categoryBreadcrumbFacet} from '../features/facets/category-facet-set/category-facet-set-analytics-actions.js';
import {logCategoryFacetBreadcrumb} from '../features/facets/category-facet-set/category-facet-set-insight-analytics-actions.js';
import {categoryFacetSetReducer} from '../features/facets/category-facet-set/category-facet-set-slice.js';
import {
  breadcrumbFacet,
  facetClearAll,
  facetDeselect,
  facetSelect,
} from '../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
} from '../features/facets/facet-set/facet-set-insight-analytics-actions.js';
import {logClearBreadcrumbs} from '../features/facets/generic/facet-generic-insight-analytics-actions.js';
import {registerDateFacet} from '../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {dateBreadcrumbFacet} from '../features/facets/range-facets/date-facet-set/date-facet-analytics-actions.js';
import {logDateFacetBreadcrumb} from '../features/facets/range-facets/date-facet-set/date-facet-insight-analytics-actions.js';
import {dateFacetSetReducer} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {DateFacetValue} from '../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {registerNumericFacet} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {numericBreadcrumbFacet} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions.js';
import {logNumericFacetBreadcrumb} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-insight-analytics-actions.js';
import {numericFacetSetReducer} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {retryGeneratedAnswer} from '../features/generated-answer/generated-answer-analytics-actions.js';
import {logRetryGeneratedAnswer} from '../features/generated-answer/generated-answer-insight-analytics-actions.js';
import {
  executeSearch,
  fetchFacetValues,
  fetchPage,
} from '../features/insight-search/insight-search-actions.js';
import {
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
} from '../features/insight-search/insight-search-analytics-actions.js';
import {browseResults} from '../features/pagination/pagination-analytics-actions.js';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
} from '../features/pagination/pagination-insight-analytics-actions.js';
import {searchboxSubmit} from '../features/query/query-analytics-actions.js';
import {logSearchboxSubmit} from '../features/query/query-insight-analytics-actions.js';
import {resultsSort} from '../features/sort-criteria/sort-criteria-analytics-actions.js';
import {logResultsSort} from '../features/sort-criteria/sort-criteria-insight-analytics-actions.js';
import {clearMicrotaskQueue} from '../test/unit-test-utils.js';
import {
  assertActionCause,
  assertNextEqualsLegacy,
  excludedBaseProperties,
} from './analytics-migration.test.js';

function getSampleInsightEngineConfiguration(): InsightEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    insightId: 'sample-insight-id',
  };
}

const nextInsightEngine = buildInsightEngine({
  configuration: {
    ...getSampleInsightEngineConfiguration(),
    analytics: {
      trackingId: 'alex',
    },
  },
});

const legacyInsightEngine = buildInsightEngine({
  configuration: {
    ...getSampleInsightEngineConfiguration(),
    analytics: {
      analyticsMode: 'legacy',
    },
  },
});

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
      legacy: logInsightInterfaceLoad(),
      next: interfaceLoad(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
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

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/deselect', async () => {
    const action = executeSearch({
      legacy: logFacetDeselect({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: facetDeselect(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/deselectAllBreadcrumbs', async () => {
    const action = executeSearch({
      legacy: logClearBreadcrumbs(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/facet/breadcrumb', async () => {
    const action = executeSearch({
      legacy: logFacetBreadcrumb({
        facetId: ANY_FACET_ID,
        facetValue: ANY_FACET_VALUE,
      }),
      next: breadcrumbFacet(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/didyoumean/click', async () => {
    const action = executeSearch({
      legacy: logDidYouMeanClick(),
      next: didYouMeanClick(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/reset', async () => {
    const action = executeSearch({
      legacy: logFacetClearAll(ANY_FACET_ID),
      next: facetClearAll(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/dateFacet/breadcrumb', async () => {
    legacyInsightEngine.addReducers({
      dateFacetSet: dateFacetSetReducer,
    });
    nextInsightEngine.addReducers({
      dateFacetSet: dateFacetSetReducer,
    });
    legacyInsightEngine.dispatch(
      registerDateFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    nextInsightEngine.dispatch(
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

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/numericFacet/breadcrumb', async () => {
    legacyInsightEngine.addReducers({
      numericFacetSet: numericFacetSetReducer,
    });
    nextInsightEngine.addReducers({
      numericFacetSet: numericFacetSetReducer,
    });
    legacyInsightEngine.dispatch(
      registerNumericFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
        generateAutomaticRanges: true,
      })
    );
    nextInsightEngine.dispatch(
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

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/categoryFacet/breadcrumb', async () => {
    legacyInsightEngine.addReducers({
      categoryFacetSet: categoryFacetSetReducer,
    });
    nextInsightEngine.addReducers({
      categoryFacetSet: categoryFacetSetReducer,
    });
    legacyInsightEngine.dispatch(
      registerCategoryFacet({
        facetId: ANY_FACET_ID,
        field: ANY_FACET_ID,
      })
    );
    nextInsightEngine.dispatch(
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

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/sort/results', async () => {
    const action = executeSearch({
      legacy: logResultsSort(),
      next: resultsSort(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/searchbox/submit', async () => {
    const action = executeSearch({
      legacy: logSearchboxSubmit(),
      next: searchboxSubmit(),
    });
    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/change', async () => {
    const action = executeSearch({
      legacy: logInsightInterfaceChange(),
      next: interfaceChange(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/generatedAnswer/retry', async () => {
    const action = executeSearch({
      legacy: logRetryGeneratedAnswer(),
      next: retryGeneratedAnswer(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/pager/next', async () => {
    const action = fetchPage({
      legacy: logPageNext(),
      next: browseResults(),
    });

    legacyInsightEngine.dispatch(action);
    await clearMicrotaskQueue();
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
    assertActionCause(callSpy, 1, 'pagerNext');
    assertActionCause(callSpy, 2, 'browseResults');
  });

  it('analytics/pager/previous', async () => {
    const action = fetchPage({
      legacy: logPagePrevious(),
      next: browseResults(),
    });

    legacyInsightEngine.dispatch(action);
    await clearMicrotaskQueue();
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
    assertActionCause(callSpy, 1, 'pagerPrevious');
    assertActionCause(callSpy, 2, 'browseResults');
  });

  it('analytics/pager/number', async () => {
    const action = fetchPage({
      legacy: logPageNumber(),
      next: browseResults(),
    });

    legacyInsightEngine.dispatch(action);
    await clearMicrotaskQueue();
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
    assertActionCause(callSpy, 1, 'pagerNumber');
    assertActionCause(callSpy, 2, 'browseResults');
  });

  it('analytics/facet/showMore', async () => {
    const action = fetchFacetValues({
      legacy: logFacetShowMore(ANY_FACET_ID),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });

  it('analytics/facet/showLess', async () => {
    const action = fetchFacetValues({
      legacy: logFacetShowLess(ANY_FACET_ID),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy, [...excludedBaseProperties, 'actionCause']);
  });
});
