import type {CartItem} from '@coveo/headless/ssr-commerce';
import {
  CART_COOKIE,
  CART_COOKIE_MAX_AGE,
  parseCartItems,
  serializeCartItems,
} from './cart.js';

/**
 * IMPORTANT: The functions in this module simulate a programming interface that
 * interacts with a cart managed through an external ecommerce system.
 *
 * For the sake of simplicity, this sample substitutes that "ecommerce system"
 * with a browser cookie. The Express server reads the same cookie to seed the
 * cart's initial state on the next server render (see `server.ts`), so the cart
 * survives navigation and reloads. In a real-life scenario, you would call an
 * external service to retrieve and update the cart state instead.
 *
 * This module runs on the client only (it reads and writes `document.cookie`).
 */

function readCart(): CartItem[] {
  return parseCartItems(document.cookie);
}

function writeCart(items: CartItem[]): void {
  const value = encodeURIComponent(serializeCartItems(items));
  document.cookie = `${CART_COOKIE}=${value}; path=/; max-age=${CART_COOKIE_MAX_AGE}; samesite=lax`;
}

export function addItemToCart(newItem: CartItem): CartItem[] {
  const cart = readCart();
  const existingItem = cart.find(
    (item) => item.productId === newItem.productId
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(newItem);
  }
  writeCart(cart);
  return cart;
}

export function updateItemQuantity(updatedItem: CartItem): CartItem[] {
  let cart = readCart();
  const existingItem = cart.find(
    (item) => item.productId === updatedItem.productId
  );
  if (existingItem) {
    if (updatedItem.quantity <= 0) {
      cart = cart.filter((item) => item.productId !== updatedItem.productId);
    } else {
      existingItem.quantity = updatedItem.quantity;
    }
  }
  writeCart(cart);
  return cart;
}

export function clearCart(): CartItem[] {
  writeCart([]);
  return [];
}
