import {setItems, updateItem} from './cart-actions';
import {cartReducer} from './cart-slice';
import {
  CartItemWithMetadata,
  CartState,
  getCartInitialState,
} from './cart-state';

describe('cart-slice', () => {
  const someItem: CartItemWithMetadata = {
    productId: 'product-id-1',
    quantity: 10,
    name: 'product 2',
    price: 50,
  };
  let state: CartState;
  beforeEach(() => {
    state = getCartInitialState();
  });

  it('should have an initial state', () => {
    expect(cartReducer(undefined, {type: 'foo'})).toEqual(
      getCartInitialState()
    );
  });

  it('#setItems replaces current cart state with specified state', () => {
    const secondItem: CartItemWithMetadata = {
      productId: 'product-id-2',
      quantity: 20,
      name: 'product 2',
      price: 100,
    };
    const updatedState = cartReducer(state, setItems([someItem, secondItem]));
    expect(updatedState.cartItems).toEqual([
      someItem.productId,
      secondItem.productId,
    ]);
    expect(updatedState.cart).toEqual({
      [someItem.productId]: someItem,
      [secondItem.productId]: secondItem,
    });
  });

  describe('#updateItem', () => {
    it('should add new item to cart if item is not already in cart and specified quantity is positive', () => {
      const updatedState = cartReducer(state, updateItem(someItem));
      expect(updatedState.cartItems).toEqual([someItem.productId]);
      expect(updatedState.cart).toEqual({
        [someItem.productId]: someItem,
      });
    });

    it('should not add new item to cart if item is not already in cart and specified quantity is 0', () => {
      const updatedState = cartReducer(
        state,
        updateItem({...someItem, quantity: 0})
      );
      expect(updatedState.cartItems).toEqual([]);
      expect(updatedState.cart).toEqual({});
    });

    it('should remove existing item from cart if specified quantity is 0', () => {
      const updatedState = cartReducer(
        {
          cartItems: [someItem.productId],
          cart: {
            [someItem.productId]: someItem,
          },
        },
        updateItem({...someItem, quantity: 0})
      );
      expect(updatedState.cartItems).toEqual([]);
      expect(updatedState.cart).toEqual({});
    });

    it('should update existing item in cart if specified quantity is greater than 0', () => {
      const updatedState = cartReducer(
        {
          cartItems: [someItem.productId],
          cart: {
            [someItem.productId]: someItem,
          },
        },
        updateItem({
          ...someItem,
          name: 'renamed product',
          quantity: 5,
          price: 25,
        })
      );
      expect(updatedState.cartItems).toEqual([someItem.productId]);
      expect(updatedState.cart).toEqual({
        [someItem.productId]: {
          productId: someItem.productId,
          name: 'renamed product',
          quantity: 5,
          price: 25,
        },
      });
    });
  });
});
