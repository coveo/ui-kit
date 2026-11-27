/**
 * Regression test for a stale `clientId` with a custom `navigatorContextProvider`: a commerce
 * request carried `clientId: ""` with `context.capture: true`, which the Commerce API rejects
 * with 412 `CLIENT_ID_REQUIRED`. The relay kept the `clientId` from an earlier provider call,
 * while `capture` came from a new one.
 */
import {getRelayInstanceFromState} from '../../api/analytics/analytics-relay-client.js';
import {fetchProductListing} from '../../features/commerce/product-listing/product-listing-actions.js';
import type {NavigatorContextProvider} from '../navigator-context-provider.js';
import {buildCommerceEngine} from './commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration.js';

describe('commerce engine with a custom navigatorContextProvider', () => {
  const visitorId = '11111111-2222-4333-8444-555555555555';
  let visitorCookie: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  // Like a storefront provider: clientId and capture both come from the visitor cookie, and
  // capture is false when clientId is empty, as the NavigatorContext docs require.
  function buildProvider(): NavigatorContextProvider {
    return () => ({
      clientId: visitorCookie,
      location: 'https://example.com/category/sofas',
      referrer: 'https://example.com/',
      userAgent: 'Mozilla/5.0',
      capture: visitorCookie !== '',
    });
  }

  function buildEngine() {
    const configuration = getSampleCommerceEngineConfiguration();
    configuration.analytics = {...configuration.analytics, enabled: true};
    return buildCommerceEngine({configuration, navigatorContextProvider: buildProvider()});
  }

  // Sends a real listing request through the engine and returns the body given to `fetch`.
  async function sendListingRequest(engine: ReturnType<typeof buildEngine>) {
    fetchMock.mockClear();
    await engine.dispatch(fetchProductListing({}));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return JSON.parse(init.body as string) as {clientId?: string; context: {capture: boolean}};
  }

  beforeEach(() => {
    // The selector is a module-level singleton, so its cache persists across tests.
    getRelayInstanceFromState.clearCache();
    visitorCookie = '';
    const emptyListingResponse = {
      responseId: 'response-id',
      products: [],
      results: [],
      facets: [],
      pagination: {page: 0, perPage: 0, totalEntries: 0, totalPages: 0},
      sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
      triggers: [],
    };
    fetchMock = vi.fn(async () => new Response(JSON.stringify(emptyListingResponse)));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('when the provider has a clientId from the start, sends #clientId with #context.capture true', async () => {
    visitorCookie = visitorId;
    const engine = buildEngine();

    const body = await sendListingRequest(engine);

    expect(body.clientId).toBe(visitorId);
    expect(body.context.capture).toBe(true);
  });

  it('when the provider clientId changes after the first request, sends the new #clientId', async () => {
    const engine = buildEngine();

    const first = await sendListingRequest(engine);
    expect(first.clientId).toBe('');
    expect(first.context.capture).toBe(false);

    visitorCookie = visitorId;
    const second = await sendListingRequest(engine);

    expect(second.context.capture).toBe(true);
    expect(second.clientId).toBe(visitorId);
  });
});
