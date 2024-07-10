import {createRelay} from '@coveo/relay';
import {createMockState} from '../../test/mock-state';
import {getRelayInstanceFromState} from './analytics-relay-client';
import {getAnalyticsSource} from './analytics-selectors';

jest.mock('@coveo/relay');
jest.mock('./analytics-selectors');

describe('#getRelayInstanceFromState', () => {
  const mockedCreateRelay = jest.mocked(createRelay).mockImplementation(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getMeta: jest.fn(),
    updateConfig: jest.fn(),
    version: 'test',
  }));

  beforeEach(() => {
    jest.mocked(getAnalyticsSource).mockReturnValue(['baguette']);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a Relay client properly and returns it', () => {
    const state = createMockState();

    const relay = getRelayInstanceFromState(state);

    expect(mockedCreateRelay).toHaveBeenCalledWith({
      mode: 'emit',
      url: state.configuration.analytics.nextApiBaseUrl,
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
