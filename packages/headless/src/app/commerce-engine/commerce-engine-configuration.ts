import {RecordValue, Schema} from '@coveo/bueno';
import {getOrganizationEndpoints} from '../../api/platform-client';
import {ContextOptions} from '../../controllers/commerce/context/headless-context';
import {contextDefinition} from '../../features/commerce/context/context-validation';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

/**
 * The commerce engine configuration options.
 *
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {
  context: ContextOptions;
}

export const commerceEngineConfigurationSchema =
  new Schema<CommerceEngineConfiguration>({
    ...engineConfigurationDefinitions,
    context: new RecordValue({
      options: {required: true},
      values: contextDefinition,
    }),
  });

export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    organizationId: 'fashioncoveodemocomgzh7iep8',
    // deepcode ignore HardcodedNonCryptoSecret: Public key freely available for our documentation
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    organizationEndpoints: getOrganizationEndpoints(
      'fashioncoveodemocomgzh7iep8'
    ),
    context: {
      language: 'en',
      country: 'CA',
      currency: 'CAD',
      view: {
        url: 'https://www.example.com',
      },
    },
  };
}
