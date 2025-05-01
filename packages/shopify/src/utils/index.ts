import {v5} from 'uuid';

/**
 * Generates a unique client identifier for the Shopify store.
 *
 * This function creates a version 5 UUID based on the provided
 * shop-specific data and the Shopify cookie value.
 *
 * @param shop - The identifier of the Shopify store.
 * @param shopifyCookie - The value of the Shopify _shopify_y cookie.
 * @returns A version 5 UUID string uniquely representing the client.
 */
export function getClientId(shop: string, shopifyCookie: string): string {
  return v5(shopifyCookie, shop);
}
