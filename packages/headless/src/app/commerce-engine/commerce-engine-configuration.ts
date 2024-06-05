import {RecordValue, Schema} from '@coveo/bueno';
import {getOrganizationEndpoints} from '../../api/platform-client';
import {CartInitialState} from '../../controllers/commerce/context/cart/headless-cart';
import {ContextOptions} from '../../controllers/commerce/context/headless-context';
import {cartDefinition} from '../../features/commerce/context/cart/cart-validation';
import {contextDefinition} from '../../features/commerce/context/context-validation';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration';

/**
 * The commerce engine configuration options.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {
  context: ContextOptions;
  cart?: CartInitialState;
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
      capture: true,
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
