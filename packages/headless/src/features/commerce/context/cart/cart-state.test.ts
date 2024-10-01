import {getProductsFromCartState} from './cart-state.js';

describe('cart-state', () => {
  it('should aggregate products with a different price', () => {
    const state = {
      cartItems: ['5', '1', '3', '2', '4'],
      cart: {
        '1': {
          productId: 'product-id-1',
          quantity: 1,
          name: 'product-name-1',
          price: 100,
        },
        '2': {
          productId: 'product-id-2',
          quantity: 2,
          name: 'product-name-2',
          price: 25,
        },
        '3': {
          productId: 'product-id-1',
          quantity: 3,
          name: 'product-name-3',
          price: 50,
        },
        '4': {
          productId: 'product-id-2',
          quantity: 2,
          name: 'product-name-4',
          price: 75,
        },
        '5': {
          productId: 'product-id-1',
          quantity: 3,
          name: 'product-name-5',
          price: 50,
        },
      },
      purchasedItems: [],
      purchased: {},
    };

    const products = getProductsFromCartState(state);

    expect(products).toEqual([
      {
        productId: 'product-id-1',
        quantity: 7,
      },
      {
        productId: 'product-id-2',
        quantity: 4,
      },
    ]);
  });
});
