import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {CartInitialState} from '../../controllers/commerce/context/cart/headless-cart';
import {ContextOptions} from '../../controllers/commerce/context/headless-context';
import {cartDefinition} from '../../features/commerce/context/cart/cart-validation';
import {contextDefinition} from '../../features/commerce/context/context-validation';
import {PlatformEnvironment} from '../../utils/url-utils';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

/**
 * The commerce engine configuration options.
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {
  context: ContextOptions;
  cart?: CartInitialState;
  environment?: PlatformEnvironment;
}

export const commerceEngineConfigurationSchema =
  new Schema<CommerceEngineConfiguration>({
    ...engineConfigurationDefinitions,
    context: new RecordValue({
      options: {required: true},
      values: contextDefinition,
    }),
    cart: new RecordValue({
      values: cartDefinition,
    }),
    environment: new StringValue<PlatformEnvironment>({
      required: false,
      constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
      emptyAllowed: false,
      default: 'prod',
    }),
  });

export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    organizationId: 'fashioncoveodemocomgzh7iep8',
    // deepcode ignore HardcodedNonCryptoSecret: Public key freely available for our documentation
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    context: {
      language: 'en',
      country: 'CA',
      currency: 'CAD',
      view: {
        url: 'https://www.example.com',
      },
    },
    cart: {
      items: [
        {
          name: 'Sample Product',
          quantity: 1,
          price: 100,
          productId: 'sample-product-id',
        },
      ],
    },
  };
}
