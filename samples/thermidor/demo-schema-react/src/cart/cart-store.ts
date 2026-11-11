import * as cartApi from './cart-api.js';
import type {AddCartItemRequest, Cart, PurchaseResult} from './cart-api.js';

export type CartClient = Pick<typeof cartApi, 'getCart' | 'addItem' | 'removeItem' | 'purchase'>;

export type CartProduct = Omit<AddCartItemRequest, 'quantity'>;

interface CartSnapshot {
  cart: Cart;
  status: 'loading' | 'ready';
  pendingProductIds: ReadonlySet<string>;
  error: Error | null;
}

export interface CartStore {
  getSnapshot(): CartSnapshot;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  add(product: CartProduct, quantity?: number): Promise<void>;
  remove(productId: string, quantity?: number): Promise<void>;
  purchase(): Promise<PurchaseResult>;
}

export const EMPTY_CART: Cart = {
  currency: 'USD',
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  total: 0,
};

/**
 * Sends one request at a time, in order, so the cart always matches the server's; the first
 * mutation waits for the initial load (which sets the cart cookie).
 */
export function createCartStore(client: CartClient = cartApi, initialCart?: Cart): CartStore {
  const listeners = new Set<() => void>();
  const pendingCounts = new Map<string, number>();
  let snapshot: CartSnapshot = {
    cart: initialCart ?? EMPTY_CART,
    status: initialCart ? 'ready' : 'loading',
    pendingProductIds: new Set(),
    error: null,
  };
  let queue: Promise<unknown> = Promise.resolve();

  function update(changes: Partial<CartSnapshot>) {
    snapshot = {...snapshot, ...changes};
    for (const listener of listeners) {
      listener();
    }
  }

  function setPending(productId: string, delta: 1 | -1) {
    const count = (pendingCounts.get(productId) ?? 0) + delta;
    if (count > 0) {
      pendingCounts.set(productId, count);
    } else {
      pendingCounts.delete(productId);
    }
    return new Set(pendingCounts.keys());
  }

  function enqueue<T>(
    call: () => Promise<T>,
    productId?: string,
    cartOf: (result: T) => Cart = (result) => result as Cart
  ): Promise<T> {
    if (productId !== undefined) {
      update({pendingProductIds: setPending(productId, 1)});
    }
    const settle = (changes: Partial<CartSnapshot>) =>
      update({
        ...changes,
        status: 'ready',
        ...(productId !== undefined && {pendingProductIds: setPending(productId, -1)}),
      });

    const result = queue.then(async () => {
      try {
        const value = await call();
        settle({cart: cartOf(value), error: null});
        return value;
      } catch (error) {
        settle({error: error instanceof Error ? error : new Error(String(error))});
        throw error;
      }
    });
    queue = result.catch(() => {});
    return result;
  }

  const quietly = (promise: Promise<unknown>) =>
    promise.then(
      () => {},
      () => {}
    );

  const store: CartStore = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load: () => quietly(enqueue(() => client.getCart())),
    add: (product, quantity = 1) =>
      quietly(enqueue(() => client.addItem({...product, quantity}), product.productId)),
    remove: (productId, quantity) =>
      quietly(enqueue(() => client.removeItem(productId, quantity), productId)),
    purchase: () =>
      enqueue(
        () => client.purchase(),
        undefined,
        () => EMPTY_CART
      ),
  };

  if (!initialCart) {
    void store.load();
  }
  return store;
}
