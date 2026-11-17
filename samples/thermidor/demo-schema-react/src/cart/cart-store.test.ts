import {describe, expect, it, vi} from 'vitest';
import type {Cart, CartLine, PurchaseResult} from './cart-api.js';
import {createCartStore, EMPTY_CART, type CartClient, type CartProduct} from './cart-store.js';

function line(productId: string, quantity = 1, unitPrice = 10): CartLine {
  return {
    productId,
    name: productId,
    imageUrl: null,
    clickUri: null,
    unitPrice,
    quantity,
    lineTotal: unitPrice * quantity,
  };
}

function cartOf(...items: CartLine[]): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    currency: 'USD',
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    total: subtotal,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return {promise, resolve};
}

function fakeClient(overrides: Partial<CartClient> = {}): CartClient {
  return {
    getCart: vi.fn(async () => EMPTY_CART),
    addItem: vi.fn(async () => EMPTY_CART),
    removeItem: vi.fn(async () => EMPTY_CART),
    purchase: vi.fn(async () => ({}) as PurchaseResult),
    ...overrides,
  };
}

async function flushPromises() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

const PRODUCT: CartProduct = {productId: 'wax', name: 'Wax', unitPrice: 4.5};

describe('createCartStore', () => {
  it('loads the cart on creation', async () => {
    const loaded = deferred<Cart>();
    const client = fakeClient({getCart: vi.fn(() => loaded.promise)});
    const store = createCartStore(client);

    await vi.waitFor(() => expect(client.getCart).toHaveBeenCalledTimes(1));
    expect(store.getSnapshot()).toEqual({
      cart: EMPTY_CART,
      status: 'loading',
      pendingProductIds: new Set(),
      error: null,
    });

    loaded.resolve(cartOf(line('wax')));
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe('ready'));
    expect(store.getSnapshot().cart).toEqual(cartOf(line('wax')));
  });

  it('starts ready from an initial cart, without loading it', async () => {
    const client = fakeClient();
    const initial = cartOf(line('wax', 2));
    const store = createCartStore(client, initial);

    expect(store.getSnapshot()).toEqual({
      cart: initial,
      status: 'ready',
      pendingProductIds: new Set(),
      error: null,
    });
    await flushPromises();
    expect(client.getCart).not.toHaveBeenCalled();
  });

  it('is ready with the error when the first load fails', async () => {
    const error = new Error('offline');
    const store = createCartStore(fakeClient({getCart: vi.fn(async () => Promise.reject(error))}));

    await vi.waitFor(() => expect(store.getSnapshot().status).toBe('ready'));
    expect(store.getSnapshot().error).toBe(error);
    expect(store.getSnapshot().cart).toEqual(EMPTY_CART);
  });

  it('reloads the cart', async () => {
    const getCart = vi
      .fn<CartClient['getCart']>()
      .mockResolvedValueOnce(EMPTY_CART)
      .mockResolvedValueOnce(cartOf(line('board')));
    const store = createCartStore(fakeClient({getCart}));

    await store.load();

    expect(getCart).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().cart).toEqual(cartOf(line('board')));
  });

  it('adds one unit by default, and replaces the cart with the one the API returns', async () => {
    const returned = cartOf(line('wax', 3));
    const client = fakeClient({addItem: vi.fn(async () => returned)});
    const store = createCartStore(client);
    await store.load();

    await store.add(PRODUCT);

    expect(client.addItem).toHaveBeenCalledWith({...PRODUCT, quantity: 1});
    expect(store.getSnapshot().cart).toBe(returned);
  });

  it('removes units, or the whole line, and replaces the cart with the one the API returns', async () => {
    const returned = cartOf(line('board'));
    const client = fakeClient({removeItem: vi.fn(async () => returned)});
    const store = createCartStore(client);

    await store.remove('wax', 2);
    await store.remove('wax');

    expect(client.removeItem).toHaveBeenNthCalledWith(1, 'wax', 2);
    expect(client.removeItem).toHaveBeenNthCalledWith(2, 'wax', undefined);
    expect(store.getSnapshot().cart).toBe(returned);
  });

  it('tracks the products with a request queued or in flight, until all their requests settle', async () => {
    const waxAdded = deferred<Cart>();
    const boardRemoved = deferred<Cart>();
    const waxRemoved = deferred<Cart>();
    const client = fakeClient({
      addItem: vi.fn(() => waxAdded.promise),
      removeItem: vi
        .fn<CartClient['removeItem']>()
        .mockReturnValueOnce(boardRemoved.promise)
        .mockReturnValueOnce(waxRemoved.promise),
    });
    const store = createCartStore(client);
    await store.load();

    const requests = [store.add(PRODUCT), store.remove('board'), store.remove('wax')];
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set(['wax', 'board']));

    waxAdded.resolve(cartOf(line('wax')));
    await requests[0];
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set(['wax', 'board']));

    await vi.waitFor(() => expect(client.removeItem).toHaveBeenCalledTimes(1));
    boardRemoved.resolve(cartOf(line('wax')));
    await requests[1];
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set(['wax']));

    await vi.waitFor(() => expect(client.removeItem).toHaveBeenCalledTimes(2));
    waxRemoved.resolve(EMPTY_CART);
    await requests[2];
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set());
  });
  it('sends a mutation made right after creation only once the first load answers', async () => {
    const loaded = deferred<Cart>();
    const client = fakeClient({
      getCart: vi.fn(() => loaded.promise),
      addItem: vi.fn(async () => cartOf(line('wax'))),
    });
    const store = createCartStore(client);

    const adding = store.add(PRODUCT);
    await flushPromises();
    expect(client.addItem).not.toHaveBeenCalled();
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set(['wax']));

    loaded.resolve(EMPTY_CART);
    await adding;
    expect(client.addItem).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().cart).toEqual(cartOf(line('wax')));
  });

  it('sends one request at a time, and applies each response in order', async () => {
    const first = deferred<Cart>();
    const second = deferred<Cart>();
    const client = fakeClient({
      addItem: vi
        .fn<CartClient['addItem']>()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise),
    });
    const store = createCartStore(client);
    await store.load();

    const adding = Promise.all([store.add(PRODUCT), store.add({...PRODUCT, productId: 'board'})]);
    await vi.waitFor(() => expect(client.addItem).toHaveBeenCalledTimes(1));
    await flushPromises();
    expect(client.addItem).toHaveBeenCalledTimes(1);

    first.resolve(cartOf(line('wax')));
    await vi.waitFor(() => expect(client.addItem).toHaveBeenCalledTimes(2));
    expect(store.getSnapshot().cart).toEqual(cartOf(line('wax')));

    second.resolve(cartOf(line('wax'), line('board')));
    await adding;
    expect(store.getSnapshot().cart).toEqual(cartOf(line('wax'), line('board')));
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set());
  });

  it('captures the error of a failed request, and keeps the cart', async () => {
    const error = new Error('Product wax is not in the cart.');
    const store = createCartStore(
      fakeClient({
        getCart: vi.fn(async () => cartOf(line('board'))),
        removeItem: vi.fn(async () => Promise.reject(error)),
      })
    );
    await store.load();

    await expect(store.remove('wax')).resolves.toBeUndefined();

    expect(store.getSnapshot().error).toBe(error);
    expect(store.getSnapshot().cart).toEqual(cartOf(line('board')));
    expect(store.getSnapshot().pendingProductIds).toEqual(new Set());
  });

  it('keeps an error while the next request is in flight, and clears it when that succeeds', async () => {
    const error = new Error('offline');
    const removed = deferred<Cart>();
    const store = createCartStore(
      fakeClient({
        removeItem: vi
          .fn<CartClient['removeItem']>()
          .mockRejectedValueOnce(error)
          .mockReturnValueOnce(removed.promise),
      })
    );
    await store.remove('wax');

    const removing = store.remove('wax');
    await flushPromises();
    expect(store.getSnapshot().error).toBe(error);

    removed.resolve(EMPTY_CART);
    await removing;
    expect(store.getSnapshot().error).toBeNull();
  });

  it('purchases the cart, returns the purchase, and empties the cart', async () => {
    const result = {transaction: {id: 'order-1', revenue: 10}} as PurchaseResult;
    const store = createCartStore(
      fakeClient({
        getCart: vi.fn(async () => cartOf(line('wax'))),
        purchase: vi.fn(async () => result),
      })
    );
    await store.load();

    await expect(store.purchase()).resolves.toBe(result);
    expect(store.getSnapshot().cart).toEqual(EMPTY_CART);
  });

  it('captures and rethrows the error of a failed purchase', async () => {
    const error = new Error('The cart is empty.');
    const store = createCartStore(fakeClient({purchase: vi.fn(async () => Promise.reject(error))}));

    await expect(store.purchase()).rejects.toBe(error);
    expect(store.getSnapshot().error).toBe(error);
  });
});
