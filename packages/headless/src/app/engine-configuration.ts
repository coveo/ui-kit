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
  /**
   * Whether to stop honoring browser privacy signals — Do Not Track (DNT) and
   * Global Privacy Control (GPC) — when deciding whether to send **legacy**
   * analytics (`analyticsMode: 'legacy'`).
   *
   * By default (`false`), Coveo libraries honor these signals: when the browser
   * presents DNT or GPC, legacy analytics is automatically disabled. Setting this
   * option to `true` is a deliberate choice that you configure in your own
   * application code; legacy analytics events are then sent even when the browser
   * presents a DNT or GPC signal.
   *
   * Coveo honors these signals by default and cannot determine whether overriding
   * them is appropriate for your use case. If you enable this option, you are
   * responsible for ensuring that doing so complies with the privacy laws and
   * obligations that apply to you. Note that GPC is legally recognized as a valid
   * opt-out mechanism in some jurisdictions (for example, under the California
   * Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act
   * (CPRA)).
   *
   * This option:
   * - applies only when `analyticsMode` is explicitly set to `'legacy'`;
   * - has no effect with `analyticsMode: 'next'`, which does not honor these signals;
   * - does not override an explicit `enabled: false` or a runtime
   *   `disableAnalytics()` call, which always disable analytics.
   *
   * @deprecated Introduced as deprecated on purpose to signal that it is
   * transitional. This option exists only to bridge legacy-analytics deployments
   * where a browser privacy signal is enforced by policy, and it will be removed
   * when legacy analytics is removed (see KIT-2844). Migrate to Event Protocol
   * (`analyticsMode: 'next'`) rather than relying on this option long term.
   *
   * @defaultValue `false`
   */
  disableBrowserPrivacySignals?: boolean;
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
        disableBrowserPrivacySignals: new BooleanValue({
          required: false,
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
    // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  };
}
