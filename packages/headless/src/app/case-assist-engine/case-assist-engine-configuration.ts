import {Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload.js';
import {
  type EngineConfiguration,
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
   * The base URL to use to proxy Coveo case assist requests (for example, `https://example.com/case-assist`).
   *
   * This is an advanced option that you only set if you proxy Coveo case assist requests through your own
   * server. In most cases, you should not set this option.
   *
   * See [Headless proxy: Case Assist](https://docs.coveo.com/en/headless/latest/usage/proxy#case-assist).
   */
  proxyBaseUrl?: string;
}

export const caseAssistEngineConfigurationSchema =
  new Schema<CaseAssistEngineConfiguration>({
    ...engineConfigurationDefinitions,
    caseAssistId: requiredNonEmptyString,
    locale: nonEmptyString,
  });
