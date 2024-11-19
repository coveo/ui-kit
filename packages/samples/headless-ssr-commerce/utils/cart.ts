import * as externalCartAPI from '@/actions/external-cart-api';
import {
  Cart as HeadlessCart,
  CartItem as HeadlessCartItem,
  Product as HeadlessProduct,
  CartState as HeadlessCartState,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless-react/ssr-commerce';
import {createRelay} from '@coveo/relay';

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
  responseId: string
) {
  const config = getSampleCommerceEngineConfiguration();
  const relay = createRelay({
    token: config.accessToken,
    trackingId: config.analytics.trackingId ?? '',
    url: `https://${config.organizationId}.analytics.org.coveo.com/rest/organizations/${config.organizationId}/events/v1`,
  });

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

  relay.emit('ec.productClick', {
    position: product.position,
    currency: 'USD',
    product: {
      productId: product.ec_product_id,
      name: product.ec_name,
      price: product.ec_price,
    },
    responseId: responseId,
  });
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
