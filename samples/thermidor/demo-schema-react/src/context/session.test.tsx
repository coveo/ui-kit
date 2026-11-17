import {render, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Cart, CartLine} from '../cart/cart-api.js';
import {CartProvider} from '../cart/CartProvider.js';
import {createCartStore, EMPTY_CART, type CartClient} from '../cart/cart-store.js';
import {answerShell} from '../test/session.js';
import {SessionProvider, useSession, type DemoSession} from './session.js';

interface RequestBody {
  action: {name: string} | null;
  context: {cart: unknown[]};
}

function line(productId: string, unitPrice: number, quantity: number): CartLine {
  return {
    productId,
    name: `${productId} name`,
    imageUrl: `https://example.com/${productId}.png`,
    clickUri: `https://example.com/${productId}`,
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

function stubConverse() {
  const bodies: RequestBody[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as RequestBody;
      bodies.push(body);
      return answerShell(body as never);
    })
  );
  return bodies;
}

function renderSession(client: CartClient) {
  const store = createCartStore(client);
  let session: DemoSession | undefined;
  function Probe() {
    session = useSession();
    return null;
  }
  render(
    <CartProvider store={store}>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </CartProvider>
  );
  return {store, session: () => session!};
}

describe('SessionProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the cart's items with every request, in context.cart", async () => {
    const bodies = stubConverse();
    const board = line('gid://shopify/ProductVariant/1', 199.99, 1);
    const wax = line('wax', 4.5, 2);
    const client: CartClient = {
      getCart: vi.fn(async () => cartOf(board)),
      addItem: vi.fn(async () => cartOf(board, wax)),
      removeItem: vi.fn(async () => EMPTY_CART),
      purchase: vi.fn(),
    };
    const {store, session} = renderSession(client);
    await store.load();
    await waitFor(() => expect(bodies.map(({action}) => action?.name)).toContain('initialize'));

    await store.add({productId: 'wax', name: 'wax name', unitPrice: 4.5}, 2);
    await session().dispatchAction({name: 'submitPrompt', payload: {prompt: 'wetsuits'}});

    expect(bodies.at(-1)?.context.cart).toEqual([
      {productId: board.productId, name: board.name, price: 199.99, quantity: 1},
      {productId: 'wax', name: 'wax name', price: 4.5, quantity: 2},
    ]);
  });

  it('sends the cart the page embedded with its first request, initialize', async () => {
    const bodies = stubConverse();
    const wax = line('wax', 4.5, 2);
    window.__DEMO_CART__ = cartOf(wax);
    try {
      render(
        <CartProvider>
          <SessionProvider />
        </CartProvider>
      );

      await waitFor(() => expect(bodies).toHaveLength(1));
      expect(bodies[0].action?.name).toBe('initialize');
      expect(bodies[0].context.cart).toEqual([
        {productId: 'wax', name: 'wax name', price: 4.5, quantity: 2},
      ]);
      expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).not.toContain('/api/cart');
    } finally {
      delete window.__DEMO_CART__;
    }
  });

  it('throws without a session or a CartProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<SessionProvider />)).toThrow(
      'SessionProvider must be used within a CartProvider, or be given a session'
    );
  });
});
