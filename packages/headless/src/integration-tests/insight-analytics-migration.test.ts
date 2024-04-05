import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {getSampleEngineConfiguration} from '../app/engine-configuration';
import {
  InsightEngineConfiguration,
  buildInsightEngine,
} from '../app/insight-engine/insight-engine';
import {NumericFacetValue} from '../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {
  interfaceChange,
  interfaceLoad,
} from '../features/analytics/analytics-actions';
import {didYouMeanClick} from '../features/did-you-mean/did-you-mean-analytics-actions';
import {logDidYouMeanClick} from '../features/did-you-mean/did-you-mean-insight-analytics-actions';
import {registerCategoryFacet} from '../features/facets/category-facet-set/category-facet-set-actions';
import {categoryBreadcrumbFacet} from '../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {logCategoryFacetBreadcrumb} from '../features/facets/category-facet-set/category-facet-set-insight-analytics-actions';
import {categoryFacetSetReducer} from '../features/facets/category-facet-set/category-facet-set-slice';
import {
  breadcrumbFacet,
  facetClearAll,
  facetDeselect,
  facetSelect,
  facetShowLess,
  facetShowMore,
  facetUpdateSort,
} from '../features/facets/facet-set/facet-set-analytics-actions';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../features/facets/facet-set/facet-set-insight-analytics-actions';
import {FacetSortCriterion} from '../features/facets/facet-set/interfaces/request';
import {breadcrumbResetAll} from '../features/facets/generic/facet-generic-analytics-actions';
import {logClearBreadcrumbs} from '../features/facets/generic/facet-generic-insight-analytics-actions';
import {registerDateFacet} from '../features/facets/range-facets/date-facet-set/date-facet-actions';
import {dateBreadcrumbFacet} from '../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {logDateFacetBreadcrumb} from '../features/facets/range-facets/date-facet-set/date-facet-insight-analytics-actions';
import {dateFacetSetReducer} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetValue} from '../features/facets/range-facets/date-facet-set/interfaces/response';
import {registerNumericFacet} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericBreadcrumbFacet} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {logNumericFacetBreadcrumb} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-insight-analytics-actions';
import {numericFacetSetReducer} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {
  rephraseGeneratedAnswer,
  retryGeneratedAnswer,
} from '../features/generated-answer/generated-answer-analytics-actions';
import {
  logRephraseGeneratedAnswer,
  logRetryGeneratedAnswer,
} from '../features/generated-answer/generated-answer-insight-analytics-actions';
import {
  executeSearch,
  fetchFacetValues,
  fetchPage,
} from '../features/insight-search/insight-search-actions';
import {
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
} from '../features/insight-search/insight-search-analytics-actions';
import {
  pagerNext,
  pagerNumber,
  pagerPrevious,
} from '../features/pagination/pagination-analytics-actions';
import {
  logPageNext,
  logPagePrevious,
  logPageNumber,
} from '../features/pagination/pagination-insight-analytics-actions';
import {searchboxSubmit} from '../features/query/query-analytics-actions';
import {logSearchboxSubmit} from '../features/query/query-insight-analytics-actions';
import {resultsSort} from '../features/sort-criteria/sort-criteria-analytics-actions';
import {logResultsSort} from '../features/sort-criteria/sort-criteria-insight-analytics-actions';
import {
  StaticFilterValueMetadata,
  staticFilterDeselect,
} from '../features/static-filter-set/static-filter-set-actions';
import {logInsightStaticFilterDeselect} from '../features/static-filter-set/static-filter-set-insight-analytics-actions';
import {clearMicrotaskQueue} from '../test/unit-test-utils';
import {assertNextEqualsLegacy} from './analytics-migration.test';

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
      analyticsMode: 'next',
      trackingId: 'alex',
    },
  },
});

const legacyInsightEngine = buildInsightEngine({
  configuration: {
    ...getSampleInsightEngineConfiguration(),
  },
});

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
      next: breadcrumbResetAll(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/sortChange', async () => {
    const action = executeSearch({
      legacy: logFacetUpdateSort({
        facetId: ANY_FACET_ID,
        sortCriterion: ANY_CRITERION,
      }),
      next: facetUpdateSort(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
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

  it('analytics/staticFilter/deselect', async () => {
    const action = executeSearch({
      legacy: logInsightStaticFilterDeselect({
        staticFilterId: ANY_STATIC_FILTER_ID,
        staticFilterValue: ANY_STATIC_FILTER_VALUE,
      }),
      next: staticFilterDeselect(),
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

  it('analytics/generatedAnswer/rephrase', async () => {
    const action = executeSearch({
      legacy: logRephraseGeneratedAnswer({answerStyle: 'default'}),
      next: rephraseGeneratedAnswer(),
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
      next: pagerNext(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/pager/previous', async () => {
    const action = fetchPage({
      legacy: logPagePrevious(),
      next: pagerPrevious(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/pager/number', async () => {
    const action = fetchPage({
      legacy: logPageNumber(),
      next: pagerNumber(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/showMore', async () => {
    const action = fetchFacetValues({
      legacy: logFacetShowMore(ANY_FACET_ID),
      next: facetShowMore(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/facet/showLess', async () => {
    const action = fetchFacetValues({
      legacy: logFacetShowLess(ANY_FACET_ID),
      next: facetShowLess(),
    });

    legacyInsightEngine.dispatch(action);
    nextInsightEngine.dispatch(action);
    await clearMicrotaskQueue();

    assertNextEqualsLegacy(callSpy);
  });
});
