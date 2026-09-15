import {createRelay} from '@coveo/relay';
import {createMockState} from '../../test/mock-state.js';
import {getAnalyticsNextApiBaseUrl} from '../platform-client.js';
import {getRelayInstanceFromState} from './analytics-relay-client.js';
import {getAnalyticsSource} from './analytics-selectors.js';

vi.mock('@coveo/relay');
vi.mock('./analytics-selectors');

describe('#getRelayInstanceFromState', () => {
  const mockedCreateRelay = vi.mocked(createRelay).mockImplementation(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getMeta: vi.fn(),
    updateConfig: vi.fn(),
    version: 'test',
  }));

  beforeEach(() => {
    // The selector is a module-level singleton, so its LRU cache persists across tests. Reset it so
    // each test starts from an empty cache rather than one populated by an earlier test.
    getRelayInstanceFromState.clearCache();
    vi.mocked(getAnalyticsSource).mockReturnValue(['baguette']);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a Relay client properly and returns it', () => {
    const state = createMockState();

    const relay = getRelayInstanceFromState(state);

    expect(mockedCreateRelay).toHaveBeenCalledWith({
      mode: 'emit',
      url: getAnalyticsNextApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
      token: state.configuration.accessToken,
      trackingId: null,
      source: expect.arrayContaining(['baguette']),
    });
    expect(mockedCreateRelay).toHaveReturnedWith(relay);
  });

  it('creates a Relay client with a trackingId if set and returns it', () => {
    const state = createMockState();
    state.configuration.analytics.trackingId = 'trackingId';

    const relay = getRelayInstanceFromState(state);

    expect(mockedCreateRelay).toHaveBeenCalledWith({
      mode: 'emit',
      url: getAnalyticsNextApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
      token: state.configuration.accessToken,
      trackingId: state.configuration.analytics.trackingId,
      source: expect.arrayContaining(['baguette']),
    });
    expect(mockedCreateRelay).toHaveReturnedWith(relay);
  });

  it('when headless analytics are disabled, relay is disabled', () => {
    const state = createMockState();
    state.configuration.analytics.enabled = false;

    getRelayInstanceFromState(state);
    expect(mockedCreateRelay).toHaveBeenCalledWith(expect.objectContaining({mode: 'disabled'}));
  });

  it('memoizes the relay instance for identical inputs', () => {
    const state = createMockState();

    const first = getRelayInstanceFromState(state);
    const second = getRelayInstanceFromState(state);

    expect(first).toBe(second);
    expect(mockedCreateRelay).toHaveBeenCalledTimes(1);
  });

  it('does not retain relay instances unboundedly across distinct access tokens', () => {
    const cacheSize = 50;
    // Share one analytics object across every state: createMockState() returns a fresh analytics
    // object each time and the selector keys the result cache on it, so a per-state copy would vary
    // a cache key independently of the token. Pinning it makes the token the only varying key.
    const sharedAnalytics = createMockState().configuration.analytics;
    const makeStateWithToken = (token: string) => {
      const state = createMockState();
      state.configuration.accessToken = token;
      state.configuration.analytics = sharedAnalytics;
      return state;
    };

    const firstInstance = getRelayInstanceFromState(makeStateWithToken('token-0'));
    const callsAfterOldest = mockedCreateRelay.mock.calls.length;

    // Fill the cache with well beyond its size in distinct tokens, so the oldest entry is evicted.
    // Overfilling (2x) rather than sizing to the exact boundary keeps the assertion robust against
    // reselect's internal ordering instead of depending on an exact off-by-one call count.
    for (let i = 1; i <= cacheSize * 2; i++) {
      getRelayInstanceFromState(makeStateWithToken(`token-${i}`));
    }

    // Re-select the oldest token through a FRESH state object: reusing the original `oldest`
    // reference would hit the (weak) argsMemoize layer and short-circuit before the result cache,
    // hiding the eviction. A new object with the same token forces the value-keyed result cache to
    // be consulted, where token-0's entry has been evicted, so a fresh instance is recomputed.
    const oldestAgain = getRelayInstanceFromState(makeStateWithToken('token-0'));

    expect(callsAfterOldest).toBe(1);
    expect(oldestAgain).not.toBe(firstInstance);
  });

  it('does not strongly retain state trees: only the value-keyed result cache is LRU-bounded', () => {
    // Regression guard for the memoization boundary. The leak lives in `memoize` (the result cache
    // keyed by the primitive token, which reselect's default weakMapMemoize never evicts), so ONLY
    // `memoize` is replaced with a bounded LRU. `argsMemoize` is deliberately left at its default
    // weakMapMemoize, which keys weakly on the argument objects (the full SSR state, the navigator
    // context) so they stay garbage-collectable; a strong bounded LRU there would instead retain up
    // to cacheSize complete state trees under per-request SSR traffic.
    const inspectable = getRelayInstanceFromState as unknown as {
      memoize: unknown;
      argsMemoize: unknown;
    };

    expect(typeof inspectable.memoize).toBe('function');
    expect(inspectable.argsMemoize).not.toBe(inspectable.memoize);
  });
});
