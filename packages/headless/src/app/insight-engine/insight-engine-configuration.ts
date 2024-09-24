import {RecordValue, Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload.js';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
  getSampleEngineConfiguration,
} from '../engine-configuration.js';

/**
 * The insight engine configuration.
 */
export interface InsightEngineConfiguration extends EngineConfiguration {
  /**
   * Specifies the unique identifier of the target insight configuration.
   */
  insightId: string;
  /**
   * Specifies the configuration for the insight search.
   */
  search?: InsightEngineSearchConfigurationOptions;
}

/**
 * The insight engine search configuration options.
 */
export interface InsightEngineSearchConfigurationOptions {
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   *
   * Notes:
   *  Coveo Machine Learning models use this information to provide contextually relevant output.
   *  Moreover, this information can be referred to in query expressions and QPL statements by using the $locale object.
   */
  locale?: string;
  /**
   * The base URL to use to proxy Coveo insight requests (e.g., `https://example.com/insight`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo insight requests through your own
   * server. In most cases, you should not set this option.
   *
   * By default, no proxy is used and the Coveo insight requests are sent directly to the Coveo platform through the
   * [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e., `https://<organizationId>.org.coveo.com` or
   * `https://<organizationId>.org<environment>.coveo.com`, if the `environment` values is specified and different from
   * `prod`).
   *
   * If you set this option, you must also implement the following proxy endpoints on your server, otherwise the insight
   * engine will not work properly:
   *
   * - `GET` `/interface` to proxy requests to [`GET` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/insight/v1/configs/<insightId>/interface`](https://docs.coveo.com/en/3430/api-reference/customer-service-api#tag/Insight-Panel/operation/insight-panel-interface-get)
   * - `POST` `/querySuggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/insight/v1/configs/<insightId>/querySuggest`](https://docs.coveo.com/en/3430/api-reference/customer-service-api#tag/Insight-Panel/operation/insight-panel-query-suggest)
   * - `GET` `/quickview` to proxy requests to [`GET` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/insight/v1/configs/<insightId>/quickview`](https://docs.coveo.com/en/3430/api-reference/customer-service-api#tag/Insight-Panel/operation/insight-panel-quickview)
   * - `POST` `/search` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/insight/v1/configs/<insightId>/search`](https://docs.coveo.com/en/3430/api-reference/customer-service-api#tag/Insight-Panel/operation/insight-panel-search)
   */
  proxyBaseUrl?: string;
}

export const insightEngineConfigurationSchema =
  new Schema<InsightEngineConfiguration>({
    ...engineConfigurationDefinitions,
    insightId: requiredNonEmptyString,
    search: new RecordValue({
      options: {
        required: false,
      },
      values: {
        locale: nonEmptyString,
      },
    }),
  });

const sampleInsightId = '2729db39-d7fd-4504-a06e-668c64968c95';

/**
 * Creates a sample search engine configuration.
 *
 * @returns The sample search engine configuration.
 */
export function getSampleInsightEngineConfiguration(): InsightEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    insightId: sampleInsightId,
  };
}
