import {Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload.js';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration.js';

/**
 * The case assist engine configuration.
 */
export interface CaseAssistEngineConfiguration extends EngineConfiguration {
  /**
   * Specifies the unique identifier of the target case assist configuration. See [Retrieving a Case Assist ID](https://docs.coveo.com/en/3328/service/manage-case-assist-configurations#retrieving-a-case-assist-id).
   */
  caseAssistId: string;
  /**
   * The locale of the current user. Must comply with IETF’s [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) definition.
   *
   * Notes:
   *  Coveo Machine Learning models use this information to provide contextually relevant output.
   *  Moreover, this information can be referred to in query expressions and QPL statements by using the $locale object.
   */
  locale?: string;
  /**
   * The first level of origin of the request, typically the identifier of the graphical case assist interface from which the request originates.
   * This value is used for analytics reporting purposes.
   */
  searchHub?: string;
  /**
   * The base URL to use to proxy Coveo case assist requests (e.g., `https://example.com/case-assist`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo case assist requests through your own
   * server. In most cases, you should not set this option.
   *
   * By default, no proxy is used and the Coveo case assist requests are sent directly to the Coveo platform through the
   * [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e., `https://<organizationId>.org.coveo.com` or
   * `https://<organizationId>.org<environment>.coveo.com`, if the `environment` values is specified and different from
   * `prod`).
   *
   * If you set this option, you must also implement the following proxy endpoints on your server, otherwise the case assist
   * engine will not work properly:
   *
   * - `POST` `/classify` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/caseassists/<caseAssistId>/classify`](https://docs.coveo.com/en/3430/api-reference/customer-service-api#tag/Case-Assist/operation/postClassify)
   * - `POST` `/documents/suggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/caseassists/<caseAssistId>/documents/suggest`](https://docs.coveo.com/en/3430/api-reference/customer-service-api#tag/Case-Assist/operation/getSuggestDocument)
   */
  proxyBaseUrl?: string;
}

export const caseAssistEngineConfigurationSchema =
  new Schema<CaseAssistEngineConfiguration>({
    ...engineConfigurationDefinitions,
    caseAssistId: requiredNonEmptyString,
    locale: nonEmptyString,
  });
