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
   * By default, no proxy is used and the Coveo commerce requests are sent directly to the Coveo platform through the
   * platform [organization endpoint](https://docs.coveo.com/en/mcc80216) resolved from the `organizationId` and
   * `environment` values provided in your engine configuration (i.e.,
   * `https://<organizationId>.org.coveo.com` or
   * `https://<organizationId>.org<environment>.coveo.com`, if the `environment` values is specified and
   * different from `prod`).
   *
   * If you set this option, you must also implement the following proxy endpoints on your server, otherwise the
   * commerce engine will not work properly:
   *
   * - `POST` `/facet` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/facet`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Facet/operation/facet)
   * - `POST` `/listing` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/listing`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Listings/operation/getListing)
   * - `POST` `/productSuggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/productSuggest`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Search/operation/productSuggest)
   * - `POST` `/querySuggest` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/querySuggest`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Search/operation/querySuggest)
   * - `POST` `/recommendations` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/recommendations`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Recommendations/operation/recommendations)
   * - `POST` `/search` to proxy requests to [`POST` `https://<organizationId>.org<environment|>.coveo.com/rest/organizations/<organizationId>/commerce/v2/search`](https://docs.coveo.com/en/103/api-reference/commerce-api#tag/Search/operation/search)
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
