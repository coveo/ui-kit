import {
  BooleanValue,
  RecordValue,
  type SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import type {
  AnalyticsClientSendEventHook,
  IRuntimeEnvironment,
} from 'coveo.analytics';
import type {PreprocessRequest} from '../api/preprocess-request.js';
import type {PlatformEnvironment} from '../utils/url-utils.js';
import {requiredNonEmptyString} from '../utils/validate-payload.js';
import type {CoveoFramework} from '../utils/version.js';

/**
 * The global headless engine configuration options.
 */
export interface EngineConfiguration {
  /**
   * The unique identifier of the target Coveo organization (for example, `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo organization.
   */
  accessToken: string;
  /**
   * A function that fetches a new access token. The function must return a Promise that resolves to a string (the new access token).
   */
  renewAccessToken?: () => Promise<string>;
  /**
   * Allows for augmenting a Platform request before it is sent.
   * @param request Request to be augmented
   * @param clientOrigin The origin of the client, can be "analyticsFetch", "analyticsBeacon" or "searchApiFetch"
   *
   * @returns Augmented request
   */
  preprocessRequest?: PreprocessRequest;
  /**
   * The Engine name (for example, myEngine). Specifying your Engine name will help in debugging when using an application with multiple Redux stores.
   * @defaultValue 'coveo-headless'
   */
  name?: string;
  /**
   * Allows configuring options related to analytics.
   */
  analytics?: AnalyticsConfiguration;
  /**
   * The environment in which the organization is hosted.
   *
   * The `dev` and `stg` environments are only available internally for Coveo employees (for example, Professional Services).
   *
   * Defaults to `prod`.
   */
  environment?: PlatformEnvironment;
}

/**
 * The analytics configuration options.
 */
export interface AnalyticsConfiguration {
  /**
   * Specifies if usage analytics tracking should be enabled.
   *
   * By default, all analytics events will be logged.
   */
  enabled?: boolean;
  /**
   * Sets the Origin Context dimension on the analytics events.
   *
   * You can use this dimension to specify the context of your application.
   * The possible values are "Search", "InternalSearch", and "CommunitySearch".
   *
   * The default value is `Search`.
   */
  originContext?: string;
  /**
   * Sets the value of the Origin Level 2 dimension on the analytics events.
   *
   * Origin level 2 is a usage analytics event metadata whose value should typically be the name/identifier of the tab from which the usage analytics event originates.
   *
   * In the context of product listing, the value should match the breadcrumb of the product listing page from which the usage analytics event originates (for example, `canoes-kayaks/kayaks/sea-kayaks`).
   *
   * When logging a usage analytics event, originLevel2 should always be set to the same value as the corresponding `tab` (parameter) Search API query parameter so Coveo Machine Learning models function properly, and usage analytics reports and dashboards are coherent.
   *
   * If left unspecified, this value will automatically try to resolve itself from the `tab` Search API query parameter.
   */
  originLevel2?: string;
  /**
   * Origin level 3 is a usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request.
   *
   * When logging a Search usage analytics event, originLevel3 should always be set to the same value as the corresponding referrer Search API query parameter so usage analytics reports and dashboards are coherent.
   *
   * This value is optional, and will automatically try to resolve itself from the referrer search parameter.
   */
  originLevel3?: string;
  /**
   * analyticsClientMiddleware allows to hook into an analytics event payload before it is sent to the Coveo platform.
   */
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  /**
   * Optional analytics runtime environment, this is needed for analytics to work correctly if you're running outside of a browser.
   * See https://github.com/coveo/coveo.analytics.js for more info.
   */
  runtimeEnvironment?: AnalyticsRuntimeEnvironment;
  /**
   * Whether analytics events should be logged anonymously.
   * If set to true, the Usage Analytics Write API will not extract the name and userDisplayName, if present, from the search token
   */
  anonymous?: boolean;
  /**
   *  The name of the device that the end user is using. It should be explicitly configured in the context of a native mobile app.
   */
  deviceId?: string;
  /**
   * Specifies the user display name for the usage analytics logs.
   */
  userDisplayName?: string;
  /**
   * Specifies the URL of the current page or component.
   */
  documentLocation?: string;
  /**
   * The unique identifier of the tracking target.
   */
  trackingId?: string;
  /**
   * The analytics client to use.
   * - `legacy`: The legacy analytics client, that is, the Coveo Analytics.js library.
   * - `next`: The next analytics client, that is, the Coveo Event Protocol with the Relay library.
   *
   * The default value is `next`.
   *
   * @default 'next'
   */
  analyticsMode?: 'legacy' | 'next';
  /**
   * Specifies the frameworks and version used around Headless (e.g. @coveo/atomic).
   * @internal
   */
  source?: Partial<Record<CoveoFramework, string>>;
  /**
   * The base URL to use to proxy Coveo analytics requests (for example, `https://example.com/analytics`).
   *
   * This is an advanced option that you only set if you proxy Coveo analytics requests through your own
   * server. In most cases, you should not set this option.
   *
   * See [Headless proxy: Analytics](https://docs.coveo.com/en/headless/latest/usage/proxy#analytics).
   */
  proxyBaseUrl?: string;
}

export type AnalyticsRuntimeEnvironment = IRuntimeEnvironment;

export const engineConfigurationDefinitions: SchemaDefinition<EngineConfiguration> =
  {
    organizationId: requiredNonEmptyString,
    accessToken: requiredNonEmptyString,
    name: new StringValue({
      required: false,
      emptyAllowed: false,
    }),
    analytics: new RecordValue({
      options: {
        required: false,
      },
      values: {
        enabled: new BooleanValue({
          required: false,
        }),
        originContext: new StringValue({
          required: false,
        }),
        originLevel2: new StringValue({
          required: false,
        }),
        originLevel3: new StringValue({
          required: false,
        }),
        analyticsMode: new StringValue<'legacy' | 'next'>({
          constrainTo: ['legacy', 'next'],
          required: false,
          default: 'next',
        }),
        proxyBaseUrl: new StringValue({
          required: false,
          url: true,
        }),
        trackingId: new StringValue({
          required: false,
          emptyAllowed: false,
          regex: /^[a-zA-Z0-9_\-.]{1,100}$/,
        }),
      },
    }),
    environment: new StringValue<PlatformEnvironment>({
      required: false,
      default: 'prod',
      constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
    }),
  };

export function getSampleEngineConfiguration(): EngineConfiguration {
  return {
    organizationId: 'searchuisamples',
    // deepcode ignore HardcodedNonCryptoSecret: Public key freely available for our documentation
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  };
}
