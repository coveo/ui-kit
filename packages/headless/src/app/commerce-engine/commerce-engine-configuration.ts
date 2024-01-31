import {Schema} from '@coveo/bueno';
import {getOrganizationEndpoints} from '../../api/platform-client';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

/**
 * The commerce engine configuration options.
 *
 * @internal WORK IN PROGRESS. DO NOT USE IN ACTUAL IMPLEMENTATIONS.
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {}

export const commerceEngineConfigurationSchema =
  new Schema<CommerceEngineConfiguration>({
    ...engineConfigurationDefinitions,
  });

export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    organizationId: 'fashioncoveodemocomgzh7iep8',
    // deepcode ignore HardcodedNonCryptoSecret: Public key freely available for our documentation
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    organizationEndpoints: getOrganizationEndpoints(
      'fashioncoveodemocomgzh7iep8'
    ),
  };
}
