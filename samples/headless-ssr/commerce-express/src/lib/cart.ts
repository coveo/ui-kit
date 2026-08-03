import type {CartItem} from '@coveo/headless/ssr-commerce';

/**
 * Shared, environment-agnostic helpers for the cart cookie that simulates an
 * external cart system. This module is imported by both the server (parses the
 * incoming `Cookie` header to seed the initial state) and the client (reads and
 * writes `document.cookie`), so it must not reference `document` or `window`.
 */

/** Name of the cookie used to persist the cart (matches the Next.js sample). */
export const CART_COOKIE = 'headless-cart';

/** How long the cart cookie lives, in seconds (24 hours). */
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24;

/**
 * Validates the shape of a value parsed from the (user-controlled) cookie.
 * Anything that isn't a well-formed cart item is dropped, so a tampered cookie
 * can never inject unexpected data into a render or the engine state.
 */
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number'
  );
}

/**
 * Parses the cart items from a raw cookie string — either a server-side
 * `Cookie` request header or the client-side `document.cookie`. Returns an
 * empty cart when the cookie is absent or malformed.
 */
export function parseCartItems(cookieHeader: string | undefined | null): CartItem[] {
  if (!cookieHeader) {
    return [];
  }

  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_COOKIE}=`));
  if (!entry) {
    return [];
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(entry.slice(CART_COOKIE.length + 1)));
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

/** Serializes cart items into the string stored as the cookie value. */
export function serializeCartItems(items: CartItem[]): string {
  return JSON.stringify(items);
}
