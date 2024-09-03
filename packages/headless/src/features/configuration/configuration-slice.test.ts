import {
  getDefaultAnalyticsNextEndpointBaseUrl,
  getDefaultOrganizationEndpointBaseUrl,
  getDefaultSearchEndpointBaseUrl,
} from '../../api/platform-client';
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
  const initialState = getConfigurationInitialState();
  const {environment} = initialState;
  const organizationId = 'myorg';

  const existingState: ConfigurationState = {
    ...initialState,
    accessToken: 'mytoken123',
    organizationId,
    platformUrl: getDefaultOrganizationEndpointBaseUrl(
      organizationId,
      'platform',
      environment
    ),
    search: {
      apiBaseUrl: getDefaultSearchEndpointBaseUrl(organizationId, environment),
      locale: 'en-US',
      timezone: 'Africa/Johannesburg',
      authenticationProviders: [],
    },
    analytics: {
      enabled: true,
      originContext: '0',
      originLevel2: '2',
      originLevel3: '3',
      apiBaseUrl: getDefaultOrganizationEndpointBaseUrl(
        organizationId,
        'analytics',
        environment
      ),
      nextApiBaseUrl: getDefaultAnalyticsNextEndpointBaseUrl(
        organizationId,
        environment
      ),
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
      const accessToken = 'mytoken123';
      const environment = 'hipaa';
      const organizationId = 'myorg';

      const expectedState: ConfigurationState = {
        ...getConfigurationInitialState(),
        accessToken,
        environment: environment,
        organizationId,
        platformUrl: getDefaultOrganizationEndpointBaseUrl(
          organizationId,
          'platform',
          environment
        ),
        analytics: {
          ...getConfigurationInitialState().analytics,
          apiBaseUrl: getDefaultOrganizationEndpointBaseUrl(
            organizationId,
            'analytics',
            environment
          ),
          nextApiBaseUrl: getDefaultAnalyticsNextEndpointBaseUrl(
            organizationId,
            environment
          ),
        },
        search: {
          ...getConfigurationInitialState().search,
          apiBaseUrl: getDefaultSearchEndpointBaseUrl(
            organizationId,
            environment
          ),
        },
      };
      expect(
        configurationReducer(
          undefined,
          updateBasic({
            organizationId,
            accessToken,
            environment,
          })
        )
      ).toEqual(expectedState);
    });

    it('works on an existing state', () => {
      const accessToken = 'mynewtoken';
      const environment = 'hipaa';
      const organizationId = 'myotherorg';

      const expectedState: ConfigurationState = {
        ...existingState,
        accessToken,
        environment,
        organizationId,
        platformUrl: getDefaultOrganizationEndpointBaseUrl(
          organizationId,
          'platform',
          environment
        ),
        analytics: {
          ...existingState.analytics,
          apiBaseUrl: getDefaultOrganizationEndpointBaseUrl(
            organizationId,
            'analytics',
            environment
          ),
          nextApiBaseUrl: getDefaultAnalyticsNextEndpointBaseUrl(
            organizationId,
            environment
          ),
        },
        search: {
          ...existingState.search,
          apiBaseUrl: getDefaultSearchEndpointBaseUrl(
            organizationId,
            environment
          ),
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateBasic({
            accessToken,
            environment,
            organizationId,
          })
        )
      ).toEqual(expectedState);
    });

    it('setting organizationId updates #organizationId, #platformUrl, #analytics.apiBaseUrl, #analytics.nextApiBaseUrl, and #search.apiBaseUrl in state', () => {
      const organizationId = 'neworganization';

      const newState = configurationReducer(
        existingState,
        updateBasic({organizationId})
      );

      expect(newState.organizationId).toBe(organizationId);

      expect(newState.platformUrl).toBe(
        getDefaultOrganizationEndpointBaseUrl(
          organizationId,
          'platform',
          existingState.environment
        )
      );
      expect(newState.analytics.apiBaseUrl).toBe(
        getDefaultOrganizationEndpointBaseUrl(
          organizationId,
          'analytics',
          existingState.environment
        )
      );

      expect(newState.analytics.nextApiBaseUrl).toBe(
        getDefaultAnalyticsNextEndpointBaseUrl(
          organizationId,
          existingState.environment
        )
      );

      expect(newState.search.apiBaseUrl).toBe(
        getDefaultSearchEndpointBaseUrl(
          organizationId,
          existingState.environment
        )
      );
    });

    it('setting environment updates #environment #platformUrl, #analytics.apiBaseUrl, #analytics.nextApiBaseUrl, and #search.apiBaseUrl in state', () => {
      const environment = 'dev';
      const newState = configurationReducer(
        existingState,
        updateBasic({environment})
      );

      expect(newState.environment).toBe(environment);

      expect(newState.platformUrl).toBe(
        getDefaultOrganizationEndpointBaseUrl(
          existingState.organizationId,
          'platform',
          environment
        )
      );

      expect(newState.analytics.apiBaseUrl).toBe(
        getDefaultOrganizationEndpointBaseUrl(
          existingState.organizationId,
          'analytics',
          environment
        )
      );

      expect(newState.analytics.nextApiBaseUrl).toBe(
        getDefaultAnalyticsNextEndpointBaseUrl(
          existingState.organizationId,
          environment
        )
      );

      expect(newState.search.apiBaseUrl).toBe(
        getDefaultSearchEndpointBaseUrl(
          existingState.organizationId,
          environment
        )
      );
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
          nextApiBaseUrl: 'https://example.com/analytics',
          apiBaseUrl: 'https://example.com/analytics',
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
            proxyBaseUrl: 'https://example.com/analytics',
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
          nextApiBaseUrl: 'https://example.com/analytics',
          apiBaseUrl: 'https://example.com/analytics',
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
            proxyBaseUrl: 'https://example.com/analytics',
            anonymous: true,
            deviceId: 'fuzz',
            userDisplayName: 'displayName',
            documentLocation: 'http://somewhere.com',
            trackingId: 'someTrackingId',
          })
        )
      ).toEqual(expectedState);
    });

    it('setting proxyBaseUrl to an URL does not return an error', () => {
      const proxyBaseUrl = 'https://example.com/analytics';
      const action = updateAnalyticsConfiguration({
        proxyBaseUrl,
      });
      expect('error' in action).toBe(false);
    });

    it('setting proxyBaseUrl to a non-URL returns an error', () => {
      const proxyBaseUrl = '/analytics';
      const action = updateAnalyticsConfiguration({
        proxyBaseUrl,
      });
      expect('error' in action).toBe(true);
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
          apiBaseUrl: 'https://example.com/search',
          locale: 'fr-CA',
          timezone: 'Africa/Johannesburg',
          authenticationProviders: ['theProvider'],
        },
      };

      expect(
        configurationReducer(
          undefined,
          updateSearchConfiguration({
            proxyBaseUrl: 'https://example.com/search',
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
          apiBaseUrl: 'https://example.com/search',
          locale: 'fr-CA',
          timezone: 'Africa/Johannesburg',
          authenticationProviders: ['theNewProvider'],
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateSearchConfiguration({
            proxyBaseUrl: 'https://example.com/search',
            locale: 'fr-CA',
            timezone: 'Africa/Johannesburg',
            authenticationProviders: ['theNewProvider'],
          })
        )
      ).toEqual(expectedState);
    });

    it('setting apiBaseUrl to an URL does not return an error', () => {
      const proxyBaseUrl = 'https://example.com/search';
      const action = updateSearchConfiguration({proxyBaseUrl});
      expect('error' in action).toBe(false);
    });

    it('setting apiBaseUrl to a non-URL returns an error', () => {
      const proxyBaseUrl = '/search';
      const action = updateSearchConfiguration({proxyBaseUrl});
      expect('error' in action).toBe(true);
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
