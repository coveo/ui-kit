import {afterEach, describe, expect, it} from 'vitest';
import type {Cart} from './cart-api.js';
import {readBootstrappedCart} from './bootstrapped-cart.js';

const CART: Cart = {
  currency: 'USD',
  items: [
    {
      productId: 'wax',
      name: 'Wax',
      imageUrl: null,
      clickUri: 'https://example.com/wax',
      unitPrice: 4.5,
      quantity: 2,
      lineTotal: 9,
    },
  ],
  totalQuantity: 2,
  subtotal: 9,
  total: 9,
};

describe('readBootstrappedCart', () => {
  afterEach(() => {
    delete window.__DEMO_CART__;
  });

  it('reads the cart the page embedded', () => {
    window.__DEMO_CART__ = CART;

    expect(readBootstrappedCart()).toEqual(CART);
  });

  it('gives undefined when the page embedded no cart', () => {
    expect(readBootstrappedCart()).toBeUndefined();
  });

  it.each([
    ['not an object', 'cart'],
    ['another currency', {...CART, currency: 'EUR'}],
    ['an item with a string quantity', {...CART, items: [{...CART.items[0], quantity: '2'}]}],
  ])('ignores a cart with %s', (_, value) => {
    window.__DEMO_CART__ = value;

    expect(readBootstrappedCart()).toBeUndefined();
  });
});
