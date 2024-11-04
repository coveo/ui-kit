'use server';

import {CartItem} from '@coveo/headless-react/ssr-commerce';
import {cookies} from 'next/headers';

function getCartFromCookies(): CartItem[] {
  const cartCookie = cookies().get('headless-cart');
  return cartCookie ? JSON.parse(cartCookie.value) : [];
}

function setCartInCookies(cart: CartItem[]) {
  cookies().set('headless-cart', JSON.stringify(cart), {
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export async function getCart(): Promise<CartItem[]> {
  return getCartFromCookies();
}

export async function addItemToCart(newItem: CartItem): Promise<CartItem[]> {
  const cart = getCartFromCookies();
  cart.push(newItem);
  setCartInCookies(cart);
  return cart;
}

export async function updateItemQuantity(
  updatedItem: CartItem
): Promise<CartItem[]> {
  let cart = getCartFromCookies();
  const existingItem = cart.find(
    (item) => item.productId === updatedItem.productId
  );
  if (existingItem) {
    if (updatedItem.quantity === 0) {
      cart = cart.filter((item) => item.productId !== updatedItem.productId);
    } else {
      existingItem.quantity = updatedItem.quantity;
    }
  }
  setCartInCookies(cart);
  return cart;
}

export async function clearCart(): Promise<CartItem[]> {
  setCartInCookies([]);
  return [];
}
