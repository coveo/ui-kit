import {vi} from 'vitest';
import type {Cart, CartLine} from '../cart/cart-api.js';
import {EMPTY_CART, type CartStore} from '../cart/cart-store.js';

type CartSnapshot = ReturnType<CartStore['getSnapshot']>;

export interface FakeCartStore extends CartStore {
  add: ReturnType<typeof vi.fn<CartStore['add']>>;
  remove: ReturnType<typeof vi.fn<CartStore['remove']>>;
  /** Replaces part of the snapshot and notifies subscribers, as a settled request would. */
  set(snapshot: Partial<CartSnapshot>): void;
}

export function cartWith(
  ...lines: Array<Pick<CartLine, 'productId' | 'quantity'> & Partial<CartLine>>
): Cart {
  const items = lines.map((line): CartLine => ({
    name: line.productId,
    imageUrl: null,
    clickUri: null,
    unitPrice: 1,
    lineTotal: (line.unitPrice ?? 1) * line.quantity,
    ...line,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    currency: 'USD',
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    total: subtotal,
  };
}

/**
 * A cart store whose snapshot tests set directly. Its actions are spies that change nothing: a test
 * sets the snapshot a request would produce.
 */
export function createFakeCartStore(initial: Partial<CartSnapshot> = {}): FakeCartStore {
  let snapshot: CartSnapshot = {
    cart: EMPTY_CART,
    status: 'ready',
    pendingProductIds: new Set(),
    error: null,
    ...initial,
  };
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(partial) {
      snapshot = {...snapshot, ...partial};
      for (const listener of listeners) listener();
    },
    load: vi.fn(async () => {}),
    add: vi.fn<CartStore['add']>(async () => {}),
    remove: vi.fn<CartStore['remove']>(async () => {}),
    purchase: vi.fn(async () => {
      throw new Error('Not implemented by the fake cart store');
    }),
  };
}
