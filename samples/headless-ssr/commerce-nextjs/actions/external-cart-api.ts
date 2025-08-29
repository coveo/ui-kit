'use server';

import type {CartItem} from '@coveo/headless-react/ssr-commerce';
import {cookies} from 'next/headers';

async function getCartFromCookies(): Promise<CartItem[]> {
  const cartCookie = (await cookies()).get('headless-cart');
  return cartCookie ? JSON.parse(cartCookie.value) : [];
}

async function setCartInCookies(cart: CartItem[]) {
  (await cookies()).set('headless-cart', JSON.stringify(cart), {
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

/**
 * IMPORTANT: The functions exported in this module are meant to simulate a programming interface that interacts
 * with a cart managed through an external ecommerce system.
 *
 * For the sake of simplicity, we substitute the "ecommerce system" with a browser cookie in this
 * example. This is obviously an abstraction. In a real-life scenario, you would interact with an
 * external service to retrieve and update the cart state.
 */

export async function getCart(): Promise<CartItem[]> {
  return getCartFromCookies();
}

export async function addItemToCart(newItem: CartItem): Promise<CartItem[]> {
  const cart = await getCartFromCookies();
  const existingItem = cart.find(
    (item) => item.productId === newItem.productId
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(newItem);
  }
  setCartInCookies(cart);
  return cart;
}

export async function updateItemQuantity(
  updatedItem: CartItem
): Promise<CartItem[]> {
  let cart = await getCartFromCookies();
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
