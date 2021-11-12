import {Schema} from '@coveo/bueno';
import {nonEmptyString} from '../../utils/validate-payload';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

/**
 * The case assist engine configuration.
 */
export interface CaseAssistEngineConfiguration extends EngineConfiguration {
  /**
   * Specifies the unique identifier of the target case assist configuration.
   */
  caseAssistId?: string;
}

export const caseAssistEngineConfigurationSchema =
  new Schema<CaseAssistEngineConfiguration>({
    ...engineConfigurationDefinitions,
    caseAssistId: nonEmptyString,
  });
