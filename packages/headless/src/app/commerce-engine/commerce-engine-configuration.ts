import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {getOrganizationEndpoints} from '../../api/platform-client';
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
 *
 * @group Engine
 * @category Commerce-specific
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

// TODO KIT-3244: Use a different sample organization
export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
    organizationId: 'barcasportsmcy01fvu',
    organizationEndpoints: getOrganizationEndpoints(
      'barcasportsmcy01fvu',
      'dev'
    ),
    analytics: {
      trackingId: 'sports',
    },
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://sports-dev.barca.group/browse/promotions/skis-boards/surfboards',
      },
    },
    cart: {
      items: [
        {
          productId: 'SP01057_00001',
          quantity: 1,
          name: 'Kayaker Canoe',
          price: 800,
        },
        {
          productId: 'SP00081_00001',
          quantity: 1,
          name: 'Bamboo Canoe Paddle',
          price: 120,
        },
        {
          productId: 'SP04236_00005',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
        {
          productId: 'SP04236_00005',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
      ],
    },
  };
}
