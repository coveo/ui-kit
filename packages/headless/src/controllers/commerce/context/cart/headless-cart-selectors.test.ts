import {itemsSelector} from '../../../../features/commerce/context/cart/cart-selector';
import {
  CartState,
  getCartInitialState,
} from '../../../../features/commerce/context/cart/cart-state';
import {
  itemSelector,
  totalQuantitySelector,
  totalPriceSelector,
} from './headless-cart-selectors';

describe('headless-cart-selectors', () => {
  let cartOptions: CartState;
  let cartState: CartState;

  function initState(preloadedState = getCartInitialState()) {
    cartState = preloadedState;
  }

  beforeEach(() => {
    jest.resetAllMocks();
    cartOptions = {
      cart: {
        ['p1_1']: {
          productId: 'p1',
          sku: 'p1_1',
          quantity: 1,
          name: 'product1',
          price: 25,
        },
        ['p1_2']: {
          productId: 'p1',
          sku: 'p1_2',
          quantity: 2,
          name: 'product2',
          price: 50,
        },
        ['p1_3']: {
          productId: 'p1',
          sku: 'p1_3',
          quantity: 3,
          name: 'product3',
          price: 100,
        },
      },
      cartItems: ['p1_1', 'p1_2', 'p1_3'],
    };
    initState(cartOptions);
  });

  describe('itemSelector', () => {
    it('should return the correct item from the cart', () => {
      const selectedItem = itemSelector(cartState, 'p1_1');
      expect(selectedItem).toEqual(cartOptions.cart['p1_1']);
    });

    it('should return undefined if the item is not found in the cart', () => {
      const selectedItem = itemSelector(cartState, 'p0');
      expect(selectedItem).toBeUndefined();
    });
  });

  describe('itemsSelector', () => {
    it('should return an array containing all items in the cart', () => {
      const selectedItems = itemsSelector(cartState);
      expect(selectedItems.sort((a, b) => (a.sku < b.sku ? -1 : 1))).toEqual([
        {
          productId: 'p1',
          sku: 'p1_1',
          quantity: 1,
          name: 'product1',
          price: 25,
        },
        {
          productId: 'p1',
          sku: 'p1_2',
          quantity: 2,
          name: 'product2',
          price: 50,
        },
        {
          productId: 'p1',
          sku: 'p1_3',
          quantity: 3,
          name: 'product3',
          price: 100,
        },
      ]);
    });
  });

  describe('totalQuantitySelector', () => {
    it('should return the sum total of the `quantity` of each item in the cart', () => {
      const totalQuantity = totalQuantitySelector(cartState);
      expect(totalQuantity).toBe(6);
    });
  });

  describe('totalPriceSelector', () => {
    it('should return the sum total of the `price` multiplied by the `quantity` of each item in the cart', () => {
      const totalPrice = totalPriceSelector(cartState);
      expect(totalPrice).toBe(425);
    });
  });
});
