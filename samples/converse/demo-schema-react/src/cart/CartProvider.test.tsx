import {act, renderHook, waitFor} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {describe, expect, it, vi} from 'vitest';
import type {Cart} from './cart-api.js';
import {CartProvider, useCart} from './CartProvider.js';
import {createCartStore, EMPTY_CART, type CartClient} from './cart-store.js';

const WAX_CART: Cart = {
  currency: 'USD',
  items: [
    {
      productId: 'wax',
      name: 'Wax',
      imageUrl: null,
      clickUri: null,
      unitPrice: 4.5,
      quantity: 2,
      lineTotal: 9,
    },
  ],
  totalQuantity: 2,
  subtotal: 9,
  total: 9,
};

function fakeClient(): CartClient {
  return {
    getCart: vi.fn(async () => EMPTY_CART),
    addItem: vi.fn(async () => WAX_CART),
    removeItem: vi.fn(),
    purchase: vi.fn(),
  };
}

describe('useCart', () => {
  it('gives the cart and its state, and re-renders when they change', async () => {
    const client = fakeClient();
    const store = createCartStore(client);
    const wrapper = ({children}: PropsWithChildren) => (
      <CartProvider store={store}>{children}</CartProvider>
    );
    const {result} = renderHook(() => useCart(), {wrapper});

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.cart).toEqual(EMPTY_CART);
    expect(result.current.pendingProductIds).toEqual(new Set());
    expect(result.current.error).toBeNull();

    await act(() => result.current.add({productId: 'wax', name: 'Wax', unitPrice: 4.5}, 2));

    expect(client.addItem).toHaveBeenCalledWith({
      productId: 'wax',
      name: 'Wax',
      unitPrice: 4.5,
      quantity: 2,
    });
    expect(result.current.cart).toEqual(WAX_CART);
  });

  it('starts from the cart the page embedded, without loading it', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    window.__DEMO_CART__ = WAX_CART;
    try {
      const {result} = renderHook(() => useCart(), {
        wrapper: ({children}: PropsWithChildren) => <CartProvider>{children}</CartProvider>,
      });

      expect(result.current.status).toBe('ready');
      expect(result.current.cart).toEqual(WAX_CART);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      delete window.__DEMO_CART__;
      vi.unstubAllGlobals();
    }
  });

  it('throws outside a CartProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within a CartProvider');
  });
});
