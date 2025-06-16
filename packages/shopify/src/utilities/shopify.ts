import {SHOPIFY_COOKIE_KEY} from '../constants';
import {CoveoShopifyCustomEvent} from '../types';

/**
 * Retrieves the value of a specified Shopify cookie by its name.
 *
 * @remarks
 * This function is intended for use in browser environments only, as it relies on the `document.cookie` API.
 * Attempting to use this function in non-browser environments will result in an error or undefined behavior.
 *
 * @param name - The name of the Shopify cookie to retrieve. Defaults to `'_shopify_y'`.
 * @returns The value of the specified cookie, or `null` if the cookie is not found.
 */
export function getShopifyCookie(name: string = SHOPIFY_COOKIE_KEY) {
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

declare global {
  interface Window {
    Shopify?: {
      analytics: {
        publish: (
          eventName: string,
          eventData: CoveoShopifyCustomEvent
        ) => void;
      };
    };
  }
}

export function publishCustomShopifyEvent(
  key: string,
  customData: CoveoShopifyCustomEvent
) {
  if (typeof window.Shopify?.analytics?.publish === 'function') {
    window.Shopify.analytics.publish(key, customData);
  }
}
