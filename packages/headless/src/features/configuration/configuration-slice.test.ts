import {configurationReducer} from './configuration-slice';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  setOriginLevel3,
  setOriginLevel2,
} from './configuration-actions';
import {platformUrl} from '../../api/platform-client';
import {
  ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state';
import {updateActiveTab} from '../tab-set/tab-set-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {allValidPlatformCombination} from '../../test/platform-url';

describe('configuration slice', () => {
  const url = platformUrl({environment: 'dev', region: 'eu'});
  const existingState: ConfigurationState = {
    ...getConfigurationInitialState(),
    accessToken: 'mytoken123',
    organizationId: 'myorg',
    search: {
      apiBaseUrl: `${url}/rest/search/v2`,
      locale: 'en-US',
      timezone: 'Africa/Johannesburg',
    },
    analytics: {
      enabled: true,
      originLevel2: '2',
      originLevel3: '3',
      apiBaseUrl: `${url}/rest/ua`,
      anonymous: false,
    },
  };

  it('should have initial state', () => {
    expect(configurationReducer(undefined, {type: 'randomAction'})).toEqual(
      getConfigurationInitialState()
    );
  });

  describe('updateBasicConfiguration', () => {
    it('works on initial state', () => {
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

    it('works on an existing state', () => {
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

    it('setting platformUrl to a relative url does not return an error', () => {
      const platformUrl = '/rest/search/v2';
      const action = updateBasicConfiguration({platformUrl});
      expect('error' in action).toBe(false);
    });

    it('setting platformUrl keep search and analytics url in sync', () => {
      allValidPlatformCombination().forEach((expectation) => {
        const newState = configurationReducer(
          existingState,
          updateBasicConfiguration({
            platformUrl: expectation.platform,
          })
        );

        expect(newState.search.apiBaseUrl).toBe(expectation.search);
        expect(newState.analytics.apiBaseUrl).toBe(expectation.analytics);
      });
    });

    it('setting platformUrl to a relative URL keep search and analytics url in sync', () => {
      const newState = configurationReducer(
        existingState,
        updateBasicConfiguration({
          platformUrl: '/foo',
        })
      );

      expect(newState.search.apiBaseUrl).toBe('/foo/rest/search/v2');
      expect(newState.analytics.apiBaseUrl).toBe('/foo/rest/ua');
    });

    it('setting platformUrl to a non relative URL pointing to a non Coveo platform keep search and analytics url in sync', () => {
      const newState = configurationReducer(
        existingState,
        updateBasicConfiguration({
          platformUrl: 'https://my.domain.com',
        })
      );

      expect(newState.search.apiBaseUrl).toBe(
        'https://my.domain.com/rest/search/v2'
      );
      expect(newState.analytics.apiBaseUrl).toBe(
        'https://my.domain.com/rest/ua'
      );
    });
  });

  describe('updateAnalyticsConfiguration', () => {
    it('works on initial state', () => {
      const expectedState: ConfigurationState = {
        ...getConfigurationInitialState(),
        analytics: {
          enabled: false,
          originLevel2: 'bar',
          originLevel3: 'buzz',
          apiBaseUrl: 'http://test.com/analytics',
          anonymous: true,
        },
      };
      expect(
        configurationReducer(
          undefined,
          updateAnalyticsConfiguration({
            enabled: false,
            originLevel2: 'bar',
            originLevel3: 'buzz',
            apiBaseUrl: 'http://test.com/analytics',
            anonymous: true,
          })
        )
      ).toEqual(expectedState);
    });

    it('works on an existing state', () => {
      const expectedState: ConfigurationState = {
        ...existingState,
        analytics: {
          enabled: true,
          originLevel2: 'bar',
          originLevel3: 'buzz',
          apiBaseUrl: 'http://test.com/analytics',
          anonymous: true,
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateAnalyticsConfiguration({
            enabled: true,
            originLevel2: 'bar',
            originLevel3: 'buzz',
            apiBaseUrl: 'http://test.com/analytics',
            anonymous: true,
          })
        )
      ).toEqual(expectedState);
    });

    it('setting apiBaseUrl to a relative url does not return an error', () => {
      const apiBaseUrl = '/rest/ua';
      const action = updateAnalyticsConfiguration({apiBaseUrl});
      expect('error' in action).toBe(false);
    });
  });

  describe('updateSearchConfiguration', () => {
    it('works on initial state', () => {
      const expectedState: ConfigurationState = {
        ...getConfigurationInitialState(),
        search: {
          apiBaseUrl: 'http://test.com/search',
          locale: 'fr-CA',
          timezone: 'Africa/Johannesburg',
        },
      };

      expect(
        configurationReducer(
          undefined,
          updateSearchConfiguration({
            apiBaseUrl: 'http://test.com/search',
            locale: 'fr-CA',
            timezone: 'Africa/Johannesburg',
          })
        )
      ).toEqual(expectedState);
    });

    it('works on existing state', () => {
      const expectedState: ConfigurationState = {
        ...existingState,
        search: {
          apiBaseUrl: 'http://test.com/search',
          locale: 'fr-CA',
          timezone: 'Africa/Johannesburg',
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateSearchConfiguration({
            apiBaseUrl: 'http://test.com/search',
            locale: 'fr-CA',
            timezone: 'Africa/Johannesburg',
          })
        )
      ).toEqual(expectedState);
    });

    it('setting apiBaseUrl to a relative url does not return an error', () => {
      const apiBaseUrl = '/rest/search/v2';
      const action = updateSearchConfiguration({apiBaseUrl});
      expect('error' in action).toBe(false);
    });
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

  it('should handle #setOriginLevel2', () => {
    const originLevel2 = 'bar';
    const state = getConfigurationInitialState();
    state.analytics.originLevel2 = 'foo';
    expect(
      configurationReducer(state, setOriginLevel2({originLevel2})).analytics
        .originLevel2
    ).toBe(originLevel2);
  });

  it('should handle #setOriginLevel3', () => {
    const originLevel3 = 'bar';
    const state = getConfigurationInitialState();
    state.analytics.originLevel3 = 'foo';
    expect(
      configurationReducer(state, setOriginLevel3({originLevel3})).analytics
        .originLevel3
    ).toBe(originLevel3);
  });

  it('#updateActiveTab updates the originLevel2 to the tab id', () => {
    const state = getConfigurationInitialState();
    state.analytics.originLevel2 = 'default';

    const finalState = configurationReducer(state, updateActiveTab('tab'));
    expect(finalState.analytics.originLevel2).toBe('tab');
  });

  describe('#restoreSearchParameters', () => {
    it('when the #tab property is a non-empty string, it updates the originLevel2', () => {
      const state = getConfigurationInitialState();
      const finalState = configurationReducer(
        state,
        restoreSearchParameters({tab: 'All'})
      );
      expect(finalState.analytics.originLevel2).toBe('All');
    });

    it('when the #tab property is an empty string, it does nothing', () => {
      const state = getConfigurationInitialState();
      state.analytics.originLevel2 = 'default';

      const finalState = configurationReducer(
        state,
        restoreSearchParameters({tab: ''})
      );
      expect(finalState.analytics.originLevel2).toBe('default');
    });
  });
});
