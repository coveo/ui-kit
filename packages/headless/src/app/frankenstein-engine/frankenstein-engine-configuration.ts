import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import type {CartInitialState} from '../../controllers/commerce/context/cart/headless-cart.js';
import type {ContextOptions} from '../../controllers/commerce/context/headless-context.js';
import {cartDefinition} from '../../features/commerce/context/cart/cart-validation.js';
import {contextDefinition} from '../../features/commerce/context/context-validation.js';
import {
  type EngineConfiguration,
  engineConfigurationDefinitions,
} from '../engine-configuration.js';
import type {SearchConfigurationOptions} from '../search-engine/search-engine-configuration.js';

/**
 * The commerce-specific configuration for the Frankenstein engine.
 */
export interface FrankensteinCommerceConfiguration {
  /**
   * The commerce analytics tracking ID (required for commerce analytics).
   */
  trackingId: string;

  /**
   * The commerce context options.
   */
  context: ContextOptions;

  /**
   * The initial cart state to restore.
   */
  cart?: CartInitialState;

  /**
   * The base URL to use to proxy Coveo commerce requests.
   *
   * See [Headless proxy: Commerce](https://docs.coveo.com/en/headless/latest/usage/proxy#commerce).
   */
  proxyBaseUrl?: string;
}

/**
 * The Frankenstein engine configuration.
 *
 * Combines search and commerce configuration into a single unified engine.
 */
export interface FrankensteinEngineConfiguration extends EngineConfiguration {
  /**
   * The global headless engine configuration options specific to the Search API.
   */
  search?: SearchConfigurationOptions;

  /**
   * The commerce-specific configuration options (required for commerce functionality).
   */
  commerce: FrankensteinCommerceConfiguration;
}

export const frankensteinEngineConfigurationSchema =
  new Schema<FrankensteinEngineConfiguration>({
    ...engineConfigurationDefinitions,
    commerce: new RecordValue({
      options: {required: true},
      values: {
        trackingId: new StringValue({
          required: true,
          emptyAllowed: false,
          regex: /^[a-zA-Z0-9_\-.]{1,100}$/,
        }),
        context: new RecordValue({
          options: {required: true},
          values: contextDefinition,
        }),
        cart: new RecordValue({
          values: cartDefinition,
        }),
        proxyBaseUrl: new StringValue({required: false, url: true}),
      },
    }),
  });
