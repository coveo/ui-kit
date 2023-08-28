import {Schema} from '@coveo/bueno';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
  getSampleEngineConfiguration,
} from '../engine-configuration';

/**
 * The commerce engine configuration options.
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {}

export const commerceEngineConfigurationSchema =
  new Schema<CommerceEngineConfiguration>({
    ...engineConfigurationDefinitions,
  });

export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
  };
}
