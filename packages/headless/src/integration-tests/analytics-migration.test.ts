import {SearchAnalyticsProvider} from '../api/analytics/search-analytics';
import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine';
import {
  logInterfaceChange,
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
} from '../features/analytics/analytics-actions';
import {SearchPageEvents} from '../features/analytics/search-action-cause';
import {OmniboxSuggestionMetadata} from '../features/query-suggest/query-suggest-analytics-actions';
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

  it('analytics/interface/change', async () => {
    const interfaceChangeTo = 'default';
    const action = executeSearch({
      legacy: logInterfaceChange(),
      next: {
        actionCause: SearchPageEvents.interfaceChange,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getInterfaceChangeMetadata(
            interfaceChangeTo
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/searchFromLink', async () => {
    const action = executeSearch({
      legacy: logSearchFromLink(),
      next: {
        actionCause: SearchPageEvents.searchFromLink,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getBaseMetadata(),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });

  it('analytics/interface/omniboxFromLink', async () => {
    const metadata: OmniboxSuggestionMetadata = {
      suggestionRanking: 0,
      partialQuery: 'a',
      partialQueries: 'a',
      suggestions: 'a',
      querySuggestResponseId: 'a',
    };
    const action = executeSearch({
      legacy: logOmniboxFromLink(metadata),
      next: {
        actionCause: SearchPageEvents.omniboxFromLink,
        getEventExtraPayload: (state) =>
          new SearchAnalyticsProvider(() => state).getOmniboxFromLinkMetadata(
            metadata
          ),
      },
    });

    legacySearchEngine.dispatch(action);
    nextSearchEngine.dispatch(action);
    await wait();

    assertNextEqualsLegacy(callSpy);
  });
});
