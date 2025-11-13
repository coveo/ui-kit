'use server';

import type {CartItem} from '@coveo/headless-react/ssr-commerce-next';
import {cookies} from 'next/headers';

async function getCartFromCookies(): Promise<CartItem[]> {
  try {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get('headless-cart');
    return cartCookie ? JSON.parse(cartCookie.value) : [];
  } catch (error) {
    console.error('Error getting cart from cookies:', error);
    return [];
  }
}

async function setCartInCookies(cart: CartItem[]) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('headless-cart', JSON.stringify(cart), {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } catch (error) {
    console.error('Error setting cart in cookies:', error);
  }
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
  await setCartInCookies(cart);
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
  await setCartInCookies(cart);
  return cart;
}

export async function clearCart(): Promise<CartItem[]> {
  await setCartInCookies([]);
  return [];
}
