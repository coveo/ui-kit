import {itemsSelector} from '../../../../features/commerce/context/cart/cart-selector.js';
import {
  type CartItemWithMetadata,
  type CartState,
  getCartInitialState,
} from '../../../../features/commerce/context/cart/cart-state.js';
import {createCartKey} from './headless-cart.js';
import {
  itemSelector,
  totalPriceSelector,
  totalQuantitySelector,
} from './headless-cart-selectors.js';

describe('headless-cart-selectors', () => {
  let cartOptions: CartState;
  let cartState: CartState;

  function initState(preloadedState = getCartInitialState()) {
    cartState = preloadedState;
  }

  const item1: CartItemWithMetadata = {
    productId: 'p1',
    name: 'product1',
    price: 25,
    quantity: 1,
  };
  const item1Key = createCartKey(item1);
  const item2: CartItemWithMetadata = {
    productId: 'p1',
    name: 'product2',
    price: 50,
    quantity: 2,
  };
  const item2Key = createCartKey(item2);
  const item3: CartItemWithMetadata = {
    productId: 'p1',
    name: 'product3',
    price: 100,
    quantity: 3,
  };
  const item3Key = createCartKey(item3);

  beforeEach(() => {
    vi.resetAllMocks();

    cartOptions = {
      cart: {
        [item1Key]: item1,
        [item2Key]: item2,
        [item3Key]: item3,
      },
      cartItems: [item1Key, item2Key, item3Key],
      purchasedItems: [],
      purchased: {},
    };
    initState(cartOptions);
  });

  describe('itemSelector', () => {
    it('should return the correct item from the cart', () => {
      const selectedItem = itemSelector(cartState, item1);
      expect(selectedItem).toEqual(cartOptions.cart[item1Key]);
    });

    it('should return undefined if the item is not found in the cart', () => {
      const item4: CartItemWithMetadata = {
        productId: 'p1',
        name: 'product3',
        price: 10000,
        quantity: 3,
      };
      const selectedItem = itemSelector(cartState, item4);
      expect(selectedItem).toBeUndefined();
    });
  });

  describe('itemsSelector', () => {
    it('should return an array containing all items in the cart', () => {
      const selectedItems = itemsSelector(cartState);
      expect(selectedItems.sort((a, b) => (a.name < b.name ? -1 : 1))).toEqual([
        {
          productId: 'p1',
          quantity: 1,
          name: 'product1',
          price: 25,
        },
        {
          productId: 'p1',
          quantity: 2,
          name: 'product2',
          price: 50,
        },
        {
          productId: 'p1',
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
