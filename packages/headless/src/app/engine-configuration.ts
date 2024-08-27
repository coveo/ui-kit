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
import {getOrganizationEndpoints} from '../api/platform-client';
import {PreprocessRequest} from '../api/preprocess-request';
import {requiredNonEmptyString} from '../utils/validate-payload';
import {CoveoFramework} from '../utils/version';

/**
 * The endpoints to use.
 *
 * For example: `https://orgid.org.coveo.com`
 *
 * The [getOrganizationEndpoints](https://github.com/coveo/ui-kit/blob/master/packages/headless/src/api/platform-client.ts) helper function can be useful to create the appropriate object.
 */
export interface CoreEngineOrganizationEndpoints {
  /**
   * The base platform endpoint.
   *
   * For example: `https://{orgid}.org.coveo.com`
   */
  platform: string;
  /**
   * The base analytics service endpoint.
   *
   * For example: `https://{orgid}.analytics.org.coveo.com`
   */
  analytics: string;
}

/**
 * The global headless engine configuration options.
 */
export interface EngineConfiguration<
  OrganizationEndpoints extends
    CoreEngineOrganizationEndpoints = CoreEngineOrganizationEndpoints,
> {
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
   * The Platform URL to use. (e.g., https://platform.cloud.coveo.com)
   * The platformUrl() helper method can be useful to know what url is available.
   *
   * @deprecated Coveo recommends using organizationEndpoints instead, since it has resiliency benefits and simplifies the overall configuration for multi-region deployments. See [Organization endpoints](https://docs.coveo.com/en/mcc80216).
   */
  platformUrl?: string;
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
   * The endpoints to use.
   *
   * For example: `https://orgid.org.coveo.com`
   *
   * The [getOrganizationEndpoints](https://github.com/coveo/ui-kit/blob/master/packages/headless/src/api/platform-client.ts) helper function can be useful to create the appropriate object.
   *
   * We recommend using this option, since it has resiliency benefits and simplifies the overall configuration for multi-region deployments.  See [Organization endpoints](https://docs.coveo.com/en/mcc80216).
   */
  organizationEndpoints?: OrganizationEndpoints;
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
   * Starting at V3.0, the default value will be `next`.
   * @default 'legacy'
   */
  analyticsMode?: 'legacy' | 'next';
  /**
   * Specifies the frameworks and version used around Headless (e.g. @coveo/atomic).
   * @internal
   */
  source?: Partial<Record<CoveoFramework, string>>;
}

export type AnalyticsRuntimeEnvironment = IRuntimeEnvironment;

export const engineConfigurationDefinitions: SchemaDefinition<EngineConfiguration> =
  {
    organizationId: requiredNonEmptyString,
    accessToken: requiredNonEmptyString,
    platformUrl: new StringValue({
      required: false,
      emptyAllowed: false,
    }),
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
        }),
      },
    }),
  };

export function getSampleEngineConfiguration(): EngineConfiguration {
  return {
    organizationId: 'searchuisamples',
    // deepcode ignore HardcodedNonCryptoSecret: Public key freely available for our documentation
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationEndpoints: getOrganizationEndpoints('searchuisamples'),
  };
}
