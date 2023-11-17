import {PlatformClient, PlatformClientCallError} from '../api/platform-client';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '../app/search-engine/search-engine';
import {
  FacetProps,
  FacetValue,
  buildFacet,
} from '../controllers/facets/facet/headless-facet';

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
    legacySearchEngine.executeFirstSearch();
    nextSearchEngine.executeFirstSearch();
    await wait();

    assertFirstEqualsSecond(callSpy);
  });

  it('analytics/facet/select', async () => {
    const props: FacetProps = {
      options: {
        field: 'test',
      },
    };
    const selection: FacetValue = {
      value: 'test',
      state: 'idle',
      numberOfResults: 1,
    };
    const legacyFacet = buildFacet(legacySearchEngine, props);
    const nextFacet = buildFacet(nextSearchEngine, props);

    legacyFacet.toggleSelect(selection);
    nextFacet.toggleSelect(selection);
    await wait();

    assertFirstEqualsSecond(callSpy);
  });
});

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

function assertFirstEqualsSecond(call: jest.SpyInstance) {
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
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function excludeProperties(obj: Record<string, unknown>) {
  const result = {...obj};
  excludedBaseProperties.forEach((prop: string) => delete result[prop]);

  if (result.customData) {
    const customData = {...result.customData};
    excludedCustomDataProperties.forEach((prop: string) => {
      delete (customData as Record<string, unknown>)[prop];
    });
    result.customData = customData;
  }
  return result;
}

const excludedBaseProperties = [
  'clientId',
  'capture',
  'clientTimestamp',
  'trackingId',
];

const excludedCustomDataProperties = ['facetTitle'];
