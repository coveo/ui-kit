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
import {PreprocessRequest} from '../api/preprocess-request';
import {requiredNonEmptyString} from '../utils/validate-payload';

/**
 * The global headless engine configuration options.
 */
export interface EngineConfigurationOptions {
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
   * The Plaform URL to use. (e.g., https://platform.cloud.coveo.com)
   * The platformUrl() helper method can be useful to know what url is available.
   */
  platformUrl?: string;
  /**
   * The Engine name (e.g., myEngine). Specifying your Engine name will help in debugging when using an application with multiple Redux stores.
   */
  name?: string;
  /**
   * Allows configuring options related to analytics.
   */
  analytics?: {
    /**
     * Specifies if usage analytics tracking should be enabled.
     *
     * By default, all analytics events will be logged.
     */
    enabled?: boolean;
    /**
     * Origin level 2 is a usage analytics event metadata whose value should typically be the name/identifier of the tab from which the usage analytics event originates.
     *
     * When logging a Search usage analytics event, originLevel2 should always be set to the same value as the corresponding tab (parameter) Search API query parameter so Coveo Machine Learning models function properly, and usage analytics reports and dashboards are coherent.
     *
     * This value is optional, and will automatically try to resolve itself from the tab search parameter.
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
    runtimeEnvironment?: IRuntimeEnvironment;
  };
}

export const engineConfigurationOptionDefinitions: SchemaDefinition<EngineConfigurationOptions> = {
  organizationId: requiredNonEmptyString,
  accessToken: requiredNonEmptyString,
  platformUrl: new StringValue({
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
      originLevel2: new StringValue({
        required: false,
      }),
      originLevel3: new StringValue({
        required: false,
      }),
    },
  }),
};
