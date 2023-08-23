import {Schema} from '@coveo/bueno';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
  getSampleEngineConfiguration,
} from '../engine-configuration';

/**
 * The commerce engine configuration.
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {}

export const commerceEngineConfigurationSchema =
  new Schema<CommerceEngineConfiguration>({
    ...engineConfigurationDefinitions,
  });

/**
 * Creates a sample commerce engine configuration.
 *
 * @returns The sample commerce engine configuration.
 */
export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
  };
}
