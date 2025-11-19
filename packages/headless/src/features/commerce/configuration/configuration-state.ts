import type {CoreConfigurationState} from '../../configuration/configuration-state.js';

export interface ConfigurationState extends CoreConfigurationState {
  /**
   * The global headless engine Commerce API configuration.
   */
  commerce: CommerceState;
}

interface CommerceState {
  /**
   * The Commerce API base URL to use.
   *
   * By default, will append `/rest/organizations/{organizationId}/commerce/v2` to the automatically resolved
   * platform [organization endpoint](https://docs.coveo.com/en/mcc80216)
   * (that is, `https;://<ORG_ID>.org<hipaa|dev|stg|>.coveo.com`)
   *
   * If necessary, you can override this value by specifying a `commerce.proxyBaseUrl` in the configuration of your
   * commerce engine, or by manually dispatching the `updateProxyBaseUrl` action.
   */
  apiBaseUrl?: string;
}

export const getConfigurationInitialState: () => ConfigurationState = () => ({
  accessToken: '',
  environment: 'prod',
  organizationId: '',
  analytics: {
    enabled: true,
    trackingId: '',
    source: {},
  },
  commerce: {},
});
