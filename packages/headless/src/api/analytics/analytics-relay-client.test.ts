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
    expect(mockedCreateRelay).toHaveBeenCalledWith(
      expect.objectContaining({mode: 'disabled'})
    );
  });
});
