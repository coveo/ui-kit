import {getOrganizationEndpoints} from '../../api/platform-client';
import {allValidPlatformCombination} from '../../test/platform-url';
import {
  updateBasicConfiguration as updateCommerceBasicConfiguration,
  updateAnalyticsConfiguration as updateCommerceAnalyticsConfiguration,
  disableAnalytics as disableCommerceAnalytics,
  enableAnalytics as enableCommerceAnalytics,
} from '../commerce/configuration/configuration-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {updateActiveTab} from '../tab-set/tab-set-actions';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  setOriginLevel3,
  setOriginLevel2,
} from './configuration-actions';
import {configurationReducer} from './configuration-slice';
import {
  ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state';

jest.mock('../../api/analytics/coveo-analytics-utils');

describe('configuration slice', () => {
  const organizationId = 'myorg';
  const organizationEndpoints = getOrganizationEndpoints(organizationId, 'dev');
  const existingState: ConfigurationState = {
    ...getConfigurationInitialState(),
    accessToken: 'mytoken123',
    organizationId,
    search: {
      apiBaseUrl: organizationEndpoints.search,
      locale: 'en-US',
      timezone: 'Africa/Johannesburg',
      authenticationProviders: [],
    },
    analytics: {
      enabled: true,
      originContext: '0',
      originLevel2: '2',
      originLevel3: '3',
      apiBaseUrl: organizationEndpoints.analytics,
      nextApiBaseUrl: `${organizationEndpoints.platform}/rest/organizations/myorg/events/v1`,
      anonymous: false,
      deviceId: 'Chrome',
      userDisplayName: 'Someone',
      documentLocation: 'http://hello.world.com',
      trackingId: 'someTrackingId',
      analyticsMode: 'legacy',
      source: {},
    },
  };

  it('should have initial state', () => {
    expect(configurationReducer(undefined, {type: 'randomAction'})).toEqual(
      getConfigurationInitialState()
    );
  });

  const describeUpdateBasic = (
    updateBasic:
      | typeof updateBasicConfiguration
      | typeof updateCommerceBasicConfiguration
  ) => {
    it('works on initial state', () => {
      const expectedState: ConfigurationState = {
        ...getConfigurationInitialState(),
        accessToken: 'mytoken123',
        organizationId: 'myorg',
      };
      expect(
        configurationReducer(
          undefined,
          updateBasic({
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
          updateBasic({
            accessToken: 'mynewtoken',
            organizationId: 'myotherorg',
          })
        )
      ).toEqual(expectedState);
    });

    it('setting platformUrl to a relative url does not return an error', () => {
      const platformUrl = '/rest/search/v2';
      const action = updateBasic({platformUrl});
      expect('error' in action).toBe(false);
    });

    it('setting platformUrl keep search and analytics url in sync', () => {
      allValidPlatformCombination().forEach((expectation) => {
        const newState = configurationReducer(
          existingState,
          updateBasic({
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
        updateBasic({
          platformUrl: '/foo',
        })
      );

      expect(newState.search.apiBaseUrl).toBe('/foo/rest/search/v2');
      expect(newState.analytics.apiBaseUrl).toBe('/foo');
    });

    it('setting platformUrl to a non relative URL pointing to a non Coveo platform keep search and analytics url in sync', () => {
      const newState = configurationReducer(
        existingState,
        updateBasic({
          platformUrl: 'https://my.domain.com',
        })
      );

      expect(newState.search.apiBaseUrl).toBe(
        'https://my.domain.com/rest/search/v2'
      );
      expect(newState.analytics.apiBaseUrl).toBe('https://my.domain.com');
    });
  };

  describe('updateBasicConfiguration', () => {
    describeUpdateBasic(updateBasicConfiguration);
  });

  describe('updateCommerceBasicConfiguration', () => {
    describeUpdateBasic(updateCommerceBasicConfiguration);
  });

  describe('updateAnalyticsConfiguration', () => {
    it('works on initial state', () => {
      const expectedState: ConfigurationState = {
        ...getConfigurationInitialState(),
        analytics: {
          enabled: false,
          originContext: 'fizz',
          originLevel2: 'bar',
          originLevel3: 'buzz',
          nextApiBaseUrl: 'http://test.com/new-analytics',
          apiBaseUrl: 'http://test.com/analytics',
          anonymous: true,
          deviceId: 'fuzz',
          userDisplayName: 'displayName',
          documentLocation: 'http://somewhere.com',
          trackingId: 'someTrackingId',
          analyticsMode: 'legacy',
          source: {},
        },
      };
      expect(
        configurationReducer(
          undefined,
          updateAnalyticsConfiguration({
            enabled: false,
            originContext: 'fizz',
            originLevel2: 'bar',
            originLevel3: 'buzz',
            nextApiBaseUrl: 'http://test.com/new-analytics',
            apiBaseUrl: 'http://test.com/analytics',
            anonymous: true,
            deviceId: 'fuzz',
            userDisplayName: 'displayName',
            documentLocation: 'http://somewhere.com',
            trackingId: 'someTrackingId',
          })
        )
      ).toEqual(expectedState);
    });

    it('works on an existing state', () => {
      const expectedState: ConfigurationState = {
        ...existingState,
        analytics: {
          enabled: true,
          originContext: 'fizz',
          originLevel2: 'bar',
          originLevel3: 'buzz',
          nextApiBaseUrl: 'http://test.com/new-analytics',
          apiBaseUrl: 'http://test.com/analytics',
          anonymous: true,
          deviceId: 'fuzz',
          userDisplayName: 'displayName',
          documentLocation: 'http://somewhere.com',
          trackingId: 'someTrackingId',
          analyticsMode: 'legacy',
          source: {},
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateAnalyticsConfiguration({
            enabled: true,
            originContext: 'fizz',
            originLevel2: 'bar',
            originLevel3: 'buzz',
            nextApiBaseUrl: 'http://test.com/new-analytics',
            apiBaseUrl: 'http://test.com/analytics',
            anonymous: true,
            deviceId: 'fuzz',
            userDisplayName: 'displayName',
            documentLocation: 'http://somewhere.com',
            trackingId: 'someTrackingId',
          })
        )
      ).toEqual(expectedState);
    });

    it('setting apiBaseUrl to a relative url does not return an error', () => {
      const apiBaseUrl = '/rest/ua';
      const action = updateAnalyticsConfiguration({
        apiBaseUrl: apiBaseUrl,
      });
      expect('error' in action).toBe(false);
    });
  });

  describe('updateCommerceAnalyticsConfiguration', () => {
    it('works on initial state', () => {
      const initialState = getConfigurationInitialState();
      const expectedState: ConfigurationState = {
        ...initialState,
        analytics: {
          ...initialState.analytics,
          enabled: false,
          trackingId: 'someTrackingId',
          source: {'@coveo/atomic': '3.0.0'},
        },
      };
      expect(
        configurationReducer(
          undefined,
          updateCommerceAnalyticsConfiguration({
            enabled: false,
            trackingId: 'someTrackingId',
            source: {'@coveo/atomic': '3.0.0'},
          })
        )
      ).toEqual(expectedState);
    });

    it('works on an existing state', () => {
      const expectedState: ConfigurationState = {
        ...existingState,
        analytics: {
          ...existingState.analytics,
          enabled: false,
          trackingId: 'someTrackingId',
          analyticsMode: 'legacy',
          source: {'@coveo/atomic': '3.0.0'},
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateAnalyticsConfiguration({
            enabled: false,
            trackingId: 'someTrackingId',
            source: {'@coveo/atomic': '3.0.0'},
          })
        )
      ).toEqual(expectedState);
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
          authenticationProviders: ['theProvider'],
        },
      };

      expect(
        configurationReducer(
          undefined,
          updateSearchConfiguration({
            apiBaseUrl: 'http://test.com/search',
            locale: 'fr-CA',
            timezone: 'Africa/Johannesburg',
            authenticationProviders: ['theProvider'],
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
          authenticationProviders: ['theNewProvider'],
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateSearchConfiguration({
            apiBaseUrl: 'http://test.com/search',
            locale: 'fr-CA',
            timezone: 'Africa/Johannesburg',
            authenticationProviders: ['theNewProvider'],
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

  it('should handle disable commerce analytics', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = true;

    expect(
      configurationReducer(state, disableCommerceAnalytics()).analytics.enabled
    ).toBe(false);
  });

  it('should handle enable analytics', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = false;
    expect(
      configurationReducer(state, enableAnalytics()).analytics.enabled
    ).toBe(true);
  });

  it('should handle enable commerce analytics', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = false;
    expect(
      configurationReducer(state, enableCommerceAnalytics()).analytics.enabled
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
