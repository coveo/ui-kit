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
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
    organizationEndpoints: getOrganizationEndpoints('searchuisamples', 'prod'),
    analytics: {
      trackingId: 'sports-ui-samples',
    },
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://sports.barca.group',
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
