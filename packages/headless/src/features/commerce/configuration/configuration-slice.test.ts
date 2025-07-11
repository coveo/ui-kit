import {updateBasicConfiguration} from '../../configuration/configuration-actions.js';
import {
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  updateBasicConfiguration as updateBasicCommerceConfiguration,
  updateProxyBaseUrl,
} from './configuration-actions.js';
import {configurationReducer} from './configuration-slice.js';
import {
  type ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state.js';

describe('commerce configuration slice', () => {
  const initialState = getConfigurationInitialState();
  const existingState: ConfigurationState = {
    accessToken: 'my-current-access-token',
    environment: 'dev',
    organizationId: 'my-current-org-id',
    analytics: {
      enabled: true,
      trackingId: 'my-current-tracking-id',
      source: {'@coveo/quantic': '1.0.0'},
    },
    commerce: {
      apiBaseUrl: 'https://commerce.example.com/v1',
    },
  };

  describe('updateBasicConfiguration', () => {
    it('works on initial state', () => {
      expect(
        configurationReducer(
          undefined,
          updateBasicConfiguration({
            accessToken: 'my-new-access-token',
            environment: 'hipaa',
            organizationId: 'my-new-org-id',
          })
        )
      ).toEqual({
        ...getConfigurationInitialState(),
        accessToken: 'my-new-access-token',
        environment: 'hipaa',
        organizationId: 'my-new-org-id',
      });
    });

    it('works on an existing state', () => {
      expect(
        configurationReducer(
          existingState,
          updateBasicConfiguration({
            accessToken: 'my-new-access-token',
            environment: 'hipaa',
            organizationId: 'my-new-org-id',
          })
        )
      ).toEqual({
        ...existingState,
        accessToken: 'my-new-access-token',
        environment: 'hipaa',
        organizationId: 'my-new-org-id',
      });
    });
  });

  describe('updateBasicCommerceConfiguration', () => {
    it('works on initial state', () => {
      expect(
        configurationReducer(
          undefined,
          updateBasicCommerceConfiguration({
            accessToken: 'my-new-access-token',
            environment: 'hipaa',
            organizationId: 'my-new-org-id',
          })
        )
      ).toEqual({
        ...getConfigurationInitialState(),
        accessToken: 'my-new-access-token',
        environment: 'hipaa',
        organizationId: 'my-new-org-id',
      });
    });

    it('works on an existing state', () => {
      expect(
        configurationReducer(
          existingState,
          updateBasicCommerceConfiguration({
            accessToken: 'my-new-access-token',
            environment: 'hipaa',
            organizationId: 'my-new-org-id',
          })
        )
      ).toEqual({
        ...existingState,
        accessToken: 'my-new-access-token',
        environment: 'hipaa',
        organizationId: 'my-new-org-id',
      });
    });
  });

  describe('updateProxBaseUrl', () => {
    it('works on initial state', () => {
      expect(
        configurationReducer(
          undefined,
          updateProxyBaseUrl({
            proxyBaseUrl: 'https://commerce.example.com/v2',
          })
        )
      ).toEqual({
        ...initialState,
        commerce: {
          apiBaseUrl: 'https://commerce.example.com/v2',
        },
      });
    });

    it('works on an existing state', () => {
      expect(
        configurationReducer(
          existingState,
          updateProxyBaseUrl({
            proxyBaseUrl: 'https://commerce.example.com/v2',
          })
        )
      ).toEqual({
        ...existingState,
        commerce: {
          apiBaseUrl: 'https://commerce.example.com/v2',
        },
      });
    });
  });

  describe('updateAnalyticsConfiguration', () => {
    it('works on initial state', () => {
      expect(
        configurationReducer(
          undefined,
          updateAnalyticsConfiguration({
            enabled: false,
            trackingId: 'my-new-tracking-id',
            source: {'@coveo/atomic': '3.0.0'},
          })
        )
      ).toEqual({
        ...initialState,
        analytics: {
          enabled: false,
          trackingId: 'my-new-tracking-id',
          source: {'@coveo/atomic': '3.0.0'},
        },
      });
    });

    it('works on an existing state', () => {
      expect(
        configurationReducer(
          existingState,
          updateAnalyticsConfiguration({
            enabled: false,
            trackingId: 'my-new-tracking-id',
            source: {'@coveo/atomic': '3.0.0'},
          })
        )
      ).toEqual({
        ...existingState,
        analytics: {
          enabled: false,
          trackingId: 'my-new-tracking-id',
          source: {'@coveo/atomic': '3.0.0'},
        },
      });
    });
  });

  it('#disableAnalytics works as expected', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = true;

    expect(
      configurationReducer(state, disableAnalytics()).analytics.enabled
    ).toBe(false);

    state.analytics.enabled = false;

    expect(
      configurationReducer(state, disableAnalytics()).analytics.enabled
    ).toBe(false);
  });

  it('#enableAnalytics works as expected', () => {
    const state = getConfigurationInitialState();
    state.analytics.enabled = false;

    expect(
      configurationReducer(state, enableAnalytics()).analytics.enabled
    ).toBe(true);

    state.analytics.enabled = true;

    expect(
      configurationReducer(state, enableAnalytics()).analytics.enabled
    ).toBe(true);
  });
});
