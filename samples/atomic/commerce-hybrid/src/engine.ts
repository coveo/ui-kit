import {
  buildCommerceEngine,
  buildContext,
  type CommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {getItems} from './store-cart.js';

/**
 * Builds the commerce engine for one page, bound to that page's catalog `view`
 * URL, using the public `barca` sample commerce configuration (safe to share).
 *
 * The engine is the whole integration surface of this sample. Every Atomic
 * interface on the page is initialized with it, and every Headless controller is
 * built from it, so both sides read and write the same state.
 *
 * The cart is read from the store on every page load and passed in as initial
 * state. Coveo receives it with every request (for cart-aware ranking and
 * recommendations) without emitting any cart event: restoring a cart is not a
 * shopper action. On Shopify, this is `{{ cart.items | json }}` in the theme.
 *
 * To use this sample as an MRE, replace the configuration with your own
 * `organizationId`/`accessToken` and your catalog URLs.
 */
export async function buildEngine(viewUrl: string) {
  const {context, ...configuration} = getSampleCommerceEngineConfiguration();

  return buildCommerceEngine({
    configuration: {
      ...configuration,
      context: {...context, view: {url: viewUrl}},
      cart: {items: await getItems()},
    },
  });
}

/**
 * Formats prices in the engine's language and currency, the same ones Atomic
 * uses for the product grid.
 */
export function priceFormatter(engine: CommerceEngine) {
  const {language, currency} = buildContext(engine).state;
  return new Intl.NumberFormat(language, {style: 'currency', currency}).format;
}
