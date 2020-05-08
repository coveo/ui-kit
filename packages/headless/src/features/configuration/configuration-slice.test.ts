import {
  getConfigurationInitialState,
  configurationReducer,
  updateBasicConfiguration,
  updateSearchConfiguration,
  renewAccessToken,
} from './configuration-slice';
import {ConfigurationState} from '../../state';

describe('configuration slice', () => {
  const existingState: ConfigurationState = {
    ...getConfigurationInitialState(),
    accessToken: 'mytoken123',
    organizationId: 'myorg',
    search: {endpoint: 'platformdev.cloud.coveo.com/search'},
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
          organization: 'myorg',
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
          organization: 'myotherorg',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateBasicConfiguration on initial state', () => {
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      search: {
        endpoint: 'thisismyendpoint.com/search',
      },
    };

    expect(
      configurationReducer(
        undefined,
        updateSearchConfiguration({
          endpoint: 'thisismyendpoint.com/search',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateBasicConfiguration an existing state', () => {
    const expectedState: ConfigurationState = {
      ...existingState,
      search: {
        endpoint: 'thisismyendpoint.com/search',
      },
    };

    expect(
      configurationReducer(
        existingState,
        updateSearchConfiguration({
          endpoint: 'thisismyendpoint.com/search',
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
