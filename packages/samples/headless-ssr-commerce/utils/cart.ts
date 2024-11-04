import {addItemToCart, clearCart, updateItemQuantity} from '@/actions/cart';
import {Cart, CartItem, Product} from '@coveo/headless-react/ssr-commerce';

type SSRCart = Omit<Cart, 'state' | 'subscribe'>;

export async function adjustQuantity(
  cart: SSRCart,
  item: CartItem,
  delta: number
) {
  const updatedItem = {
    ...item,
    quantity: item.quantity + delta,
  };

  cart.updateItemQuantity(updatedItem);
  await updateItemQuantity(updatedItem);
}

export async function addToCart(cart: SSRCart, product: Product) {
  const item = {
    name: product.ec_name!,
    price: product.ec_price!,
    productId: product.ec_product_id!,
    quantity: 1,
  };

  cart.updateItemQuantity(item);
  await addItemToCart(item);
}

export async function purchase(cart: SSRCart, totalPrice: number) {
  cart.purchase({id: crypto.randomUUID(), revenue: totalPrice});
  await clearCart();
}

export async function emptyCart(cart: SSRCart) {
  cart.empty();
  await clearCart();
}
