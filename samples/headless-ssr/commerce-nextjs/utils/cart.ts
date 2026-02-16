import type {
  Cart as HeadlessCart,
  CartItem as HeadlessCartItem,
  CartState as HeadlessCartState,
  Product as HeadlessProduct,
  InstantProducts,
  ProductList,
} from '@coveo/headless-react/ssr-commerce';
import * as externalCartAPI from '@/actions/external-cart-api';

type HeadlessSSRCart = Omit<HeadlessCart, 'state' | 'subscribe'>;

export async function adjustQuantity(
  headlessCart: HeadlessSSRCart,
  item: HeadlessCartItem,
  delta: number
) {
  const updatedItem = {
    ...item,
    quantity: item.quantity + delta,
  };

  headlessCart.updateItemQuantity(updatedItem);
  // Update the item in the external service
  await externalCartAPI.updateItemQuantity(updatedItem);
}

export async function addToCart(
  headlessCart: HeadlessSSRCart,
  headlessCartState: HeadlessCartState,
  product: HeadlessProduct,
  methods:
    | Omit<InstantProducts | ProductList, 'state' | 'subscribe'>
    | undefined
) {
  const existingItem = headlessCartState.items.find(
    (item) => item.productId === product.ec_product_id
  );

  const quantity = existingItem ? existingItem.quantity + 1 : 1;
  const item = {
    name: product.ec_name!,
    price: product.ec_price!,
    productId: product.ec_product_id!,
    quantity: quantity,
  };

  headlessCart.updateItemQuantity(item);
  // Add the item to the external service
  await externalCartAPI.addItemToCart(item);

  // When sending cart events directly from the search result page, product listing pages, or from recommendation slots, you must send an additional click event along with the cart event.
  //
  // See https://docs.coveo.com/en/o1n93466/coveo-for-commerce/capture-cart-events#send-an-additional-click-event
  methods?.interactiveProduct({options: {product}}).select();
}

export async function purchase(
  headlessCart: HeadlessSSRCart,
  totalPrice: number
) {
  headlessCart.purchase({id: crypto.randomUUID(), revenue: totalPrice});
  // Clear the cart in the external service
  await externalCartAPI.clearCart();
}

export async function emptyCart(headlessCart: HeadlessSSRCart) {
  headlessCart.empty();
  // Clear the cart in the external service
  await externalCartAPI.clearCart();
}
