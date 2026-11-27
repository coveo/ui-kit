/**
 * Reproduces a stale `clientId` when a custom `navigatorContextProvider` is used.
 *
 * Symptom: commerce requests fail with 412 `CLIENT_ID_REQUIRED`
 * ("Client ID is required when capture is enabled."), because the request body has
 * `clientId: ""` together with `context.capture: true`.
 *
 * The bug is not in one place. Two pieces combine:
 *
 * 1. `getEnvironment` in `src/api/analytics/analytics-relay-client.ts` calls the provider once
 *    and keeps its `clientId`, `location`, `referrer` and `userAgent`. It runs inside the
 *    memoized `getRelayInstanceFromState` selector, keyed on the provider function, so these
 *    values stay fixed for the life of the engine.
 * 2. `getNavigatorContext` in `src/app/navigator-context-provider.ts` calls the provider again
 *    on each request (so `capture` is current), then overwrites `clientId` with the kept value
 *    from the relay.
 *
 * When the provider returns an empty `clientId` the first time the relay is resolved (for
 * example, the `coveo_visitorId` cookie is not written yet on a first visit), later requests
 * send `clientId: ""` with `capture: true` once the cookie exists.
 */
import {getRelayInstanceFromState} from '../../api/analytics/analytics-relay-client.js';
import {buildBaseCommerceAPIRequest} from '../../features/commerce/common/base-commerce-api-request-builder.js';
import {getNavigatorContext, type NavigatorContextProvider} from '../navigator-context-provider.js';
import {stateKey} from '../state-key.js';
import {buildCommerceEngine} from './commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration.js';

describe('commerce engine with a custom navigatorContextProvider', () => {
  const visitorId = '063c1e7e-73dc-459e-ac62-2af5dde7e256';
  let cookie: string;

  // Like a storefront provider: clientId and capture both come from the visitor cookie, and
  // capture is false when clientId is empty, as the NavigatorContext docs require.
  const provider: NavigatorContextProvider = () => ({
    clientId: cookie,
    location: 'https://example.com/category/sofas',
    referrer: 'https://example.com/',
    userAgent: 'Mozilla/5.0',
    capture: cookie !== '',
  });

  function buildEngine() {
    const configuration = getSampleCommerceEngineConfiguration();
    configuration.analytics = {...configuration.analytics, enabled: true};
    return buildCommerceEngine({configuration, navigatorContextProvider: provider});
  }

  // Builds the base request the same way a commerce thunk (for example fetchProductListing)
  // does with its `extra.navigatorContext` getter in `src/app/engine.ts`.
  function buildRequest(engine: ReturnType<typeof buildEngine>) {
    const state = engine[stateKey];
    const relay = getRelayInstanceFromState(state, provider);
    return buildBaseCommerceAPIRequest(state, getNavigatorContext(relay, provider));
  }

  beforeEach(() => {
    cookie = '';
  });

  it('when the provider has a clientId from the start, sends #clientId with #context.capture true', () => {
    cookie = visitorId;
    const engine = buildEngine();

    const request = buildRequest(engine);

    expect(request.clientId).toBe(visitorId);
    expect(request.context.capture).toBe(true);
  });

  it('when the provider clientId changes after the first request, sends the new #clientId', () => {
    const engine = buildEngine();

    const first = buildRequest(engine);
    expect(first.clientId).toBe('');
    expect(first.context.capture).toBe(false);

    cookie = visitorId;
    const second = buildRequest(engine);

    expect(second.context.capture).toBe(true);
    // Fails today: the relay kept the clientId from the first provider call, so this is "".
    expect(second.clientId).toBe(visitorId);
  });
});
