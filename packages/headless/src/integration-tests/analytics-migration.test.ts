import {SearchAnalyticsProvider} from '../api/analytics/search-analytics';
import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {SearchPageEvents} from '../features/analytics/search-action-cause';
import {logDidYouMeanClick} from '../features/did-you-mean/did-you-mean-analytics-actions';
import {
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
} from '../features/facets/facet-set/facet-set-analytics-actions';
import {logClearBreadcrumbs} from '../features/facets/generic/facet-generic-analytics-actions';
import {
  logNavigateBackward,
  logNavigateForward,
  logNoResultsBack,
} from '../features/history/history-analytics-actions';
import {logRecentQueryClick} from '../features/recent-queries/recent-queries-analytics-actions';
import {executeSearch} from '../features/search/search-actions';

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

  it('analytics/didyoumean/click', async () => {
    const action = executeSearch({
      legacy: logDidYouMeanClick(),
      next: {
        actionCause: SearchPageEvents.didyoumeanClick,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
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
  it('analytics/facet/deselectAllBreadcrumbs', async () => {
    const action = executeSearch({
      legacy: logClearBreadcrumbs(),
      next: {
        actionCause: SearchPageEvents.breadcrumbResetAll,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
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
  it('history/analytics/forward', async () => {
    const action = executeSearch({
      legacy: logNavigateForward(),
      next: {
        actionCause: SearchPageEvents.historyForward,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('history/analytics/backward', async () => {
    const action = executeSearch({
      legacy: logNavigateBackward(),
      next: {
        actionCause: SearchPageEvents.historyBackward,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('history/analytics/noresultsback', async () => {
    const action = executeSearch({
      legacy: logNoResultsBack(),
      next: {
        actionCause: SearchPageEvents.noResultsBack,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
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
});
