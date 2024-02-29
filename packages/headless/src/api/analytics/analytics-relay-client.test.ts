import {createRelay} from '@coveo/relay';
import {createMockState} from '../../test/mock-state';
import {getRelayInstanceFromState} from './analytics-relay-client';

jest.mock('@coveo/relay');

describe('#getRelayInstanceFromState', () => {
  const mockedCreateRelay = jest.mocked(createRelay).mockImplementation(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    clearStorage: jest.fn(),
    getMeta: jest.fn(),
    updateConfig: jest.fn(),
    version: 'test',
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a Relay client properly and returns it', () => {
    const state = createMockState();

    const relay = getRelayInstanceFromState(state);

    expect(mockedCreateRelay).toHaveBeenCalledWith({
      url: state.configuration.analytics.nextApiBaseUrl,
      token: state.configuration.accessToken,
      trackingId: state.configuration.analytics.trackingId,
      source: expect.arrayContaining([]),
    });
    expect(mockedCreateRelay).toHaveReturnedWith(relay);
  });
});
