import type {
  Cart,
  CartItem,
  CartState,
  Product,
  ProductList,
} from '@coveo/headless/ssr-commerce';
import * as externalCartApi from '../lib/externalCartApi.js';

/** The Cart controller surface used by the UI (no `state`/`subscribe`). */
type CartMethods = Omit<Cart, 'state' | 'subscribe'>;

/** The ProductList controller surface used to log product-click events. */
type ProductListMethods = Omit<ProductList, 'state' | 'subscribe'>;

/**
 * Adds one unit of `product` to the cart.
 *
 * Each cart mutation is applied in two places: the Coveo `cart` controller,
 * which emits the `ec.cartAction` analytics event, and the external cart system
 * (`externalCartApi`), which owns the actual cart contents. When a cart event
 * originates from a product listing, an accompanying product-click event must
 * also be sent.
 *
 * @see https://docs.coveo.com/en/o1n93466/coveo-for-commerce/capture-cart-events#send-an-additional-click-event
 */
export function addToCart(
  cart: CartMethods,
  cartState: CartState,
  product: Product,
  productList?: ProductListMethods
): void {
  const existingItem = cartState.items.find(
    (item) => item.productId === product.ec_product_id
  );
  const quantity = existingItem ? existingItem.quantity + 1 : 1;
  const item: CartItem = {
    name: product.ec_name ?? 'Unknown product',
    price: product.ec_promo_price ?? product.ec_price ?? 0,
    productId: product.ec_product_id ?? '',
    quantity,
  };

  cart.updateItemQuantity(item);
  externalCartApi.addItemToCart(item);

  // Send the click event that must accompany a cart event sent from a listing.
  productList?.interactiveProduct({options: {product}}).select();
}

/** Changes the quantity of an existing cart `item` by `delta` (may be negative). */
export function adjustQuantity(
  cart: CartMethods,
  item: CartItem,
  delta: number
): void {
  const updatedItem: CartItem = {...item, quantity: item.quantity + delta};
  cart.updateItemQuantity(updatedItem);
  externalCartApi.updateItemQuantity(updatedItem);
}

/** Completes the purchase, emptying both the Coveo cart and the external system. */
export function purchase(cart: CartMethods, totalPrice: number): void {
  cart.purchase({id: crypto.randomUUID(), revenue: totalPrice});
  externalCartApi.clearCart();
}

/** Empties the cart in both the Coveo cart and the external system. */
export function emptyCart(cart: CartMethods): void {
  cart.empty();
  externalCartApi.clearCart();
}
