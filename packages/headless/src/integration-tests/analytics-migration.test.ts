import {SearchAnalyticsProvider} from '../api/analytics/search-analytics';
import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {SearchPageEvents} from '../features/analytics/search-action-cause';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUpdateSort,
} from '../features/facets/facet-set/facet-set-analytics-actions';
import {executeSearch} from '../features/search/search-actions';
import {FacetSortCriterion} from '../ssr.index';

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
});
