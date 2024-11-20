import * as externalCartAPI from '@/actions/external-cart-api';
import {
  Cart as HeadlessCart,
  CartItem as HeadlessCartItem,
  Product as HeadlessProduct,
  CartState as HeadlessCartState,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless-react/ssr-commerce';
import {createRelay} from '@coveo/relay';
import {defaultContext} from './context';

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

// When sending cart events directly from the search result page, product listing pages, or from recommendation slots, you must send an additional click event along with the cart event.
//
// See https://docs.coveo.com/en/o1n93466/coveo-for-commerce/capture-cart-events#send-an-additional-click-event
//
// This is an example of how to send the product click event.
function sendProductClickEvent(product: HeadlessProduct, responseId: string) {
  const config = getSampleCommerceEngineConfiguration();
  const relay = createRelay({
    token: config.accessToken,
    trackingId: config.analytics.trackingId ?? '',
    url: `https://${config.organizationId}.analytics.org.coveo.com/rest/organizations/${config.organizationId}/events/v1`,
  });

  relay.emit('ec.productClick', {
    position: product.position,
    currency: defaultContext.currency,
    product: {
      productId: product.ec_product_id,
      name: product.ec_name,
      price: product.ec_price,
    },
    responseId: responseId,
  });
}

export async function addToCart(
  headlessCart: HeadlessSSRCart,
  headlessCartState: HeadlessCartState,
  product: HeadlessProduct,
  responseId?: string
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

  if (responseId) {
    // Send the product click event
    sendProductClickEvent(product, responseId);
  }
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
