import {
  buildCart,
  type CartItem,
  type CommerceEngine,
  type Product,
} from '@coveo/headless/commerce';
import * as storeCart from './store-cart.js';

/**
 * The seam between the store's cart and Coveo.
 *
 * Every change goes to the store first, because the store owns the cart. Only
 * once it succeeds is the same change mirrored into the Headless `Cart`
 * controller, which updates the cart state sent with every Commerce API request
 * and emits the `ec.cartAction` / `ec.purchase` events. Mirroring after the
 * store call means a failed add never reaches Coveo as a cart event.
 *
 * Atomic has no cart component, so this is Headless *extending* an Atomic
 * storefront rather than replacing part of it.
 */

/**
 * Maps a Coveo product to a cart item. Use the same mapping everywhere: the
 * `Cart` controller identifies an item by `productId`, `name`, and `price`
 * together, so a mismatch creates a second line instead of updating the first.
 */
export function toCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.ec_product_id ?? product.permanentid,
    name: product.ec_name ?? product.permanentid,
    price: product.ec_promo_price ?? product.ec_price ?? 0,
    quantity,
  };
}

export async function setQuantity(engine: CommerceEngine, item: CartItem) {
  await storeCart.setQuantity(item);
  buildCart(engine).updateItemQuantity(item);
}

export async function addOne(engine: CommerceEngine, item: CartItem) {
  const existing = buildCart(engine).state.items.find(
    ({productId}) => productId === item.productId
  );
  await setQuantity(engine, {...item, quantity: (existing?.quantity ?? 0) + 1});
}

export async function placeOrder(engine: CommerceEngine) {
  const transaction = await storeCart.checkout();
  buildCart(engine).purchase(transaction);
  return transaction;
}
