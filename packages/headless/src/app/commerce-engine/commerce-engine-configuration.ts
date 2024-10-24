import {BooleanValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {CartInitialState} from '../../controllers/commerce/context/cart/headless-cart.js';
import {ContextOptions} from '../../controllers/commerce/context/headless-context.js';
import {cartDefinition} from '../../features/commerce/context/cart/cart-validation.js';
import {contextDefinition} from '../../features/commerce/context/context-validation.js';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload.js';
import {
  AnalyticsConfiguration,
  EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration.js';

/**
 * The commerce engine configuration.
 */
export interface CommerceEngineConfiguration extends EngineConfiguration {
  /**
   * The commerce analytics configuration.
   */
  analytics: Pick<
    AnalyticsConfiguration,
    'enabled' | 'proxyBaseUrl' | 'source' | 'trackingId'
  >;
  /**
   * The commerce context options.
   */
  context: ContextOptions;
  /**
   * The initial cart state to restore.
   */
  cart?: CartInitialState;
  /**
   * The base URL to use to proxy Coveo commerce requests (e.g., `https://example.com/commerce`).
   *
   * This is an advanced option that you should only set if you need to proxy Coveo commerce requests through your own
   * server. In most cases, you should not set this option.
   *
   * See [Headless proxy: Commerce](https://docs.coveo.com/en/headless/latest/usage/proxy#commerce).
   **/
  proxyBaseUrl?: string;
}

export const commerceEngineConfigurationSchema =
  new Schema<CommerceEngineConfiguration>({
    ...engineConfigurationDefinitions,
    analytics: new RecordValue({
      options: {required: true},
      values: {
        enabled: new BooleanValue({required: false, default: true}),
        proxyBaseUrl: new StringValue({required: false, url: true}),
        source: new RecordValue({
          options: {required: false},
          values: {
            '@coveo/atomic': nonEmptyString,
            '@coveo/quantic': nonEmptyString,
          },
        }),
        trackingId: requiredNonEmptyString,
      },
    }),
    context: new RecordValue({
      options: {required: true},
      values: contextDefinition,
    }),
    cart: new RecordValue({
      values: cartDefinition,
    }),
    proxyBaseUrl: new StringValue({required: false, url: true}),
  });

export function getSampleCommerceEngineConfiguration(): CommerceEngineConfiguration {
  return {
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
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
    organizationId: 'searchuisamples',
  };
}
