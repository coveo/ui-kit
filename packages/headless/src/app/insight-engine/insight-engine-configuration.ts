import {Schema} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

/**
 * The insight engine configuration.
 */
export interface InsightEngineConfiguration extends EngineConfiguration {
  /**
   * Specifies the unique identifier of the target insight configuration.
   */
  insightId: string;
}

export const insightEngineConfigurationSchema =
  new Schema<InsightEngineConfiguration>({
    ...engineConfigurationDefinitions,
    insightId: requiredNonEmptyString,
  });
