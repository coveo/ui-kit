import {BOOTSTRAPPED_CART_GLOBAL, type Cart} from './cart-api.js';

declare global {
  interface Window {
    [BOOTSTRAPPED_CART_GLOBAL]?: unknown;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isNullableString = (value: unknown) => value === null || typeof value === 'string';

function isCartLine(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.productId === 'string' &&
    typeof value.name === 'string' &&
    isNullableString(value.imageUrl) &&
    isNullableString(value.clickUri) &&
    isNumber(value.unitPrice) &&
    isNumber(value.quantity) &&
    isNumber(value.lineTotal)
  );
}

function isCart(value: unknown): value is Cart {
  return (
    isRecord(value) &&
    value.currency === 'USD' &&
    Array.isArray(value.items) &&
    value.items.every(isCartLine) &&
    isNumber(value.totalQuantity) &&
    isNumber(value.subtotal) &&
    isNumber(value.total)
  );
}

/** The cart the bootstrap script embedded, or `undefined` when it is missing or malformed. */
export function readBootstrappedCart(): Cart | undefined {
  const value: unknown =
    typeof window === 'undefined' ? undefined : window[BOOTSTRAPPED_CART_GLOBAL];
  return isCart(value) ? value : undefined;
}
