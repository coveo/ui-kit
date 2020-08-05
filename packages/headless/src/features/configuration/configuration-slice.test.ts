import {
  getConfigurationInitialState,
  configurationReducer,
  ConfigurationState,
} from './configuration-slice';
import {
  renewAccessToken,
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
} from './configuration-actions';
import {platformUrl} from '../../api/platform-client';

describe('configuration slice', () => {
  const fakeRenewToken = async () => await Promise.resolve('');

  it('should have initial state', () => {
    expect(configurationReducer(undefined, {type: 'randomAction'})).toEqual(
      getConfigurationInitialState()
    );
  });

  it('should handle updateBasicConfiguration', () => {
    const url = platformUrl({environment: 'dev', region: 'eu-west-3'});
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      accessToken: 'mytoken123',
      organizationId: 'myorg',
      platformUrl: url,
      search: {
        apiBaseUrl: `${url}/rest/search/v2`,
      },
      analytics: {
        enabled: true,
        apiBaseUrl: `${url}/rest/ua`,
      },
    };
    expect(
      configurationReducer(
        undefined,
        updateBasicConfiguration({
          organizationId: 'myorg',
          accessToken: 'mytoken123',
          platformUrl: url,
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateSearchConfiguration', () => {
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      search: {
        apiBaseUrl: 'http://test.com/search',
      },
    };

    expect(
      configurationReducer(
        undefined,
        updateSearchConfiguration({
          apiBaseUrl: 'http://test.com/search',
          pipeline: '',
          searchHub: '',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle updateAnalyticsConfiguration', () => {
    const expectedState: ConfigurationState = {
      ...getConfigurationInitialState(),
      analytics: {
        apiBaseUrl: 'http://test.com/analytics',
        enabled: true,
      },
    };

    expect(
      configurationReducer(
        undefined,
        updateAnalyticsConfiguration({
          apiBaseUrl: 'http://test.com/analytics',
        })
      )
    ).toEqual(expectedState);
  });

  it('should handle renewAccessToken.fulfilled', () => {
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

  it('should handle disable analytics', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = true;

    expect(
      configurationReducer(state, disableAnalytics()).analytics.enabled
    ).toBe(false);
  });

  it('should handle enable analytics', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = false;
    expect(
      configurationReducer(state, enableAnalytics()).analytics.enabled
    ).toBe(true);
  });
});
