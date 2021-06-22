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

describe('configuration slice', () => {
  const url = platformUrl({environment: 'dev', region: 'eu-west-3'});
  const existingState: ConfigurationState = {
    ...getConfigurationInitialState(),
    accessToken: 'mytoken123',
    organizationId: 'myorg',
    search: {
      apiBaseUrl: `${url}/rest/search/v2`,
      locale: 'en-US',
    },
    analytics: {
      enabled: true,
      originLevel2: '2',
      originLevel3: '3',
      apiBaseUrl: `${url}/rest/ua`,
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
        },
      };

      expect(
        configurationReducer(
          undefined,
          updateSearchConfiguration({
            apiBaseUrl: 'http://test.com/search',
            locale: 'fr-CA',
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
        },
      };

      expect(
        configurationReducer(
          existingState,
          updateSearchConfiguration({
            apiBaseUrl: 'http://test.com/search',
            locale: 'fr-CA',
          })
        )
      ).toEqual(expectedState);
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
});
