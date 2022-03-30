import {Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

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
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
   * Coveo Machine Learning models use this information to provide contextually relevant output.
   * Notes:
   *    This parameter will be overridden if the search request is authenticated by a search token that enforces a specific searchHub.
   *    When logging a Search usage analytics event for a query, the originLevel1 field of that event should be set to the value of the searchHub search request parameter.
   */
  searchHub?: string;
}

export const caseAssistEngineConfigurationSchema =
  new Schema<CaseAssistEngineConfiguration>({
    ...engineConfigurationDefinitions,
    caseAssistId: requiredNonEmptyString,
    locale: nonEmptyString,
  });
