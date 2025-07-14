import {
  restoreSearchParameters,
  restoreTab,
} from '../search-parameters/search-parameter-actions.js';
import {updateActiveTab} from '../tab-set/tab-set-actions.js';
import {
  disableAnalytics,
  enableAnalytics,
  setOriginLevel2,
  setOriginLevel3,
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
  updateSearchConfiguration,
} from './configuration-actions.js';
import {configurationReducer} from './configuration-slice.js';
import {
  type ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state.js';

vi.mock('../../api/analytics/coveo-analytics-utils');

describe('configuration slice', () => {
  const initialState = getConfigurationInitialState();
  const organizationId = 'myorg';

  const existingState: ConfigurationState = {
    ...initialState,
    accessToken: 'mytoken123',
    organizationId,
    search: {
      locale: 'en-US',
      timezone: 'Africa/Johannesburg',
      authenticationProviders: [],
    },
    analytics: {
      enabled: true,
      originContext: '0',
      originLevel2: '2',
      originLevel3: '3',
      anonymous: false,
      deviceId: 'Chrome',
      userDisplayName: 'Someone',
      documentLocation: 'http://hello.world.com',
      trackingId: 'someTrackingId',
      analyticsMode: 'next',
      source: {},
    },
  };

  it('should have initial state', () => {
    expect(configurationReducer(undefined, {type: 'randomAction'})).toEqual(
      getConfigurationInitialState()
    );
  });

  describe('updateBasicConfiguration', () => {
    it('works on initial state', () => {
      const accessToken = 'mytoken123';
      const environment = 'hipaa';
      const organizationId = 'myorg';

      const expectedState: ConfigurationState = {
        ...getConfigurationInitialState(),
        accessToken,
        environment: environment,
        organizationId,
        analytics: {
          ...getConfigurationInitialState().analytics,
        },
        search: {
          ...getConfigurationInitialState().search,
        },
      };
      expect(
        configurationReducer(
          undefined,
          updateBasicConfiguration({
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
        analytics: {
          ...existingState.analytics,
        },
        search: {
          ...existingState.search,
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateBasicConfiguration({
            accessToken,
            environment,
            organizationId,
          })
        )
      ).toEqual(expectedState);
    });
  });

  describe('updateAnalyticsConfiguration', () => {
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
          updateAnalyticsConfiguration({
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
          analyticsMode: 'next',
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

  describe('#restoreTab', () => {
    it('updates the originLevel2 to the tab id', () => {
      const state = getConfigurationInitialState();
      const finalState = configurationReducer(
        state,
        restoreTab('restoredTabId')
      );
      expect(finalState.analytics.originLevel2).toBe('restoredTabId');
    });
  });

  describe('#restoreSearchParameters', () => {
    it('updates the originLevel2 to the tab id', () => {
      const state = getConfigurationInitialState();
      const finalState = configurationReducer(
        state,
        restoreSearchParameters({tab: 'restoredTabId'})
      );
      expect(finalState.analytics.originLevel2).toBe('restoredTabId');
    });
  });
});
