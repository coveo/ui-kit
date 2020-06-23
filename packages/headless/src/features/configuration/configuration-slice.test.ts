import {
  getConfigurationInitialState,
  configurationReducer,
} from './configuration-slice';
import {
  renewAccessToken,
  updateBasicConfiguration,
  updateSearchConfiguration,
} from './configuration-actions';
import {ConfigurationState} from '../../state';

describe('configuration slice', () => {
  const existingState: ConfigurationState = {
    ...getConfigurationInitialState(),
    accessToken: 'mytoken123',
    organizationId: 'myorg',
    search: {
      searchApiBaseUrl: 'https://platformdev.cloud.coveo.com/rest/search',
    },
  };
  const fakeRenewToken = async () => await Promise.resolve('');

  it('should have initial state', () => {
    expect(configurationReducer(undefined, {type: 'randomAction'})).toEqual(
      getConfigurationInitialState()
    );
  });

  it('should handle updateBasicConfiguration on initial state', () => {
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      accessToken: 'mytoken123',
      organizationId: 'myorg',
    };
    expect(
      configurationReducer(
        undefined,
        updateBasicConfiguration({
          organizationId: 'myorg',
          accessToken: 'mytoken123',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateBasicConfiguration on an existing state', () => {
    const expectedState: ConfigurationState = {
      ...existingState,
      accessToken: 'mynewtoken',
      organizationId: 'myotherorg',
    };

    expect(
      configurationReducer(
        existingState,
        updateBasicConfiguration({
          accessToken: 'mynewtoken',
          organizationId: 'myotherorg',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateBasicConfiguration on initial state', () => {
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      search: {
        searchApiBaseUrl: 'http://test.com/search',
      },
    };

    expect(
      configurationReducer(
        undefined,
        updateSearchConfiguration({
          searchApiBaseUrl: 'http://test.com/search',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateBasicConfiguration an existing state', () => {
    const expectedState: ConfigurationState = {
      ...existingState,
      search: {
        searchApiBaseUrl: 'http://test.com/search',
      },
    };

    expect(
      configurationReducer(
        existingState,
        updateSearchConfiguration({
          searchApiBaseUrl: 'http://test.com/search',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle renewAccessToken.fulfilled on initial state', () => {
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      accessToken: 'mytoken123',
    };
    expect(
      configurationReducer(
        undefined,
        renewAccessToken.fulfilled('mytoken123', '', fakeRenewToken)
      )
    ).toEqual(expectedState);
  });

  it('should handle renewAccessToken.fulfilled on an existing state', () => {
    const expectedState: ConfigurationState = {
      ...existingState,
      accessToken: 'mynewtoken123',
    };

    expect(
      configurationReducer(
        existingState,
        renewAccessToken.fulfilled('mynewtoken123', '', fakeRenewToken)
      )
    ).toEqual(expectedState);
  });
});
