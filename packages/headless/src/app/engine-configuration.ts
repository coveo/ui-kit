import {
  BooleanValue,
  RecordValue,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {
  AnalyticsClientSendEventHook,
  IRuntimeEnvironment,
} from 'coveo.analytics';
import {PreprocessRequest} from '../api/preprocess-request.js';
import {PlatformEnvironment} from '../utils/url-utils.js';
import {requiredNonEmptyString} from '../utils/validate-payload.js';
import {CoveoFramework} from '../utils/version.js';

/**
 * The global headless engine configuration options.
 */
export interface EngineConfiguration {
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
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
   * The Engine name (e.g., myEngine). Specifying your Engine name will help in debugging when using an application with multiple Redux stores.
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
   * The `dev` and `stg` environments are only available internally for Coveo employees (e.g., Professional Services).
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
   * - `legacy`: The legacy analytics client, i.e., the Coveo Analytics.js library.
   * - `next`: The next analytics client, i.e., the Coveo Event Protocol with the Relay library.
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
   * The base URL to use to proxy Coveo analytics requests (e.g., `https://example.com/analytics`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo analytics requests through your own
   * server. In most cases, you should not set this option.
   *
   * By default, no proxy is used and the Coveo analytics requests are sent directly to the Coveo platform through the
   * analytics [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e.,
   * `https://<organizationId>.analytics.org.coveo.com` or
   * `https://<organizationId>.analytics.org<environment>.coveo.com`, if the `environment` values is specified and
   * different from `prod`).
   *
   * If you set this option, you must also implement the correct proxy endpoints on your server, depending on the
   * `analyticsMode` you are using.
   *
   * If you are using the `next` analytics mode, you must implement the following proxy endpoints:
   *
   * - `POST` `/` to proxy requests to [`POST https://<organizationId>.analytics.org<environment|>.coveo.com/rest/organizations/{organizationId}/events/v1`](https://platform.cloud.coveo.com/docs?urls.primaryName=Event#/Event%20API/rest_organizations_paramId_events_v1_post)
   * - `POST` `/validate` to proxy requests to [`POST https://<organizationId>.analytics.org<environment|>.coveo.com/rest/organizations/{organizationId}/events/v1/validate`](https://platform.cloud.coveo.com/docs?urls.primaryName=Event#/Event%20API/rest_organizations_paramId_events_v1_validate_post)
   *
   * The [Event Protocol Reference](https://docs.coveo.com/en/n9da0377) provides documentation on the analytics event
   * schemas that can be passed as request bodies to the above endpoints.
   *
   * If your are using the `legacy` analytics mode, your `proxyBaseUrl` must end with `/rest/v15/analytics`, and you must implement the following proxy endpoints:
   *
   * - `POST` `/click` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/click`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_click)
   * - `POST` `/collect` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/collect`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_collect)
   * - `POST` `/custom` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/custom`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_custom)
   * - `GET` `/monitoring/health` to proxy requests to [`GET` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/monitoring/health`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/get__v15_analytics_monitoring_health)
   * - `POST` `/search` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/search`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_search)
   * - `POST` `/searches` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/searches`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_searches)
   * - `GET` `/status` to proxy requests to [`GET` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/status`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/get__v15_analytics_status)
   * - `POST` `/view` to proxy requests to [`POST` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/view`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/post__v15_analytics_view)
   * - `DELETE` `/visit` to proxy requests to [`DELETE` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/visit`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/delete__v15_analytics_visit)
   * - `GET` `/visit` to proxy requests to [`GET` `https://<organizationId>.analytics.org<environment|>.coveo.com/rest/v15/analytics/visit`](https://docs.coveo.com/en/18/api-reference/usage-analytics-write-api#tag/Analytics-API-Version-15/operation/get__v15_analytics_visit)
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
