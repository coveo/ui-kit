import type {CartItem, Transaction} from '@coveo/headless/commerce';

/**
 * Stands in for your commerce platform's cart: Shopify's Ajax Cart API, a
 * Salesforce Commerce Cloud basket, or your own backend.
 *
 * The platform owns the cart. Coveo only needs to be told about it, which is what
 * `cart.ts` does. This sample has no backend, so the cart lives in local storage;
 * replace these three functions with calls to your platform and nothing else in
 * the sample has to change.
 */

const storageKey = 'coveo-hybrid-sample-cart';

function read(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

export async function getItems(): Promise<CartItem[]> {
  return read();
}

/**
 * Sets the quantity of an item, adding it when it is new and removing it when
 * the quantity is `0`.
 */
export async function setQuantity(item: CartItem): Promise<void> {
  const items = read();
  const index = items.findIndex((existing) => existing.productId === item.productId);

  if (index === -1) {
    items.push(item);
  } else {
    items[index] = item;
  }

  write(items.filter((existing) => existing.quantity > 0));
}

/**
 * Places the order and empties the cart. Returns what Coveo needs to know about
 * the transaction.
 */
export async function checkout(): Promise<Transaction> {
  const revenue = read().reduce((total, item) => total + item.price * item.quantity, 0);
  write([]);
  return {id: `order-${Date.now()}`, revenue};
}
