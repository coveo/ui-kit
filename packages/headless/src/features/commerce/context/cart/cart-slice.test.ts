import {
  addItem,
  removeItem,
  setItems,
  updateItemQuantity,
} from './cart-actions';
import {cartReducer} from './cart-slice';
import {CartState, getCartInitialState} from './cart-state';

describe('cart-slice', () => {
  const someItem = {
    productId: 'product-id-1',
    quantity: 100,
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

  it('should allow to set cart items', () => {
    const secondItem = {
      productId: 'a-second-product',
      quantity: 200,
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

  it('should allow to add an item', () => {
    const updatedState = cartReducer(state, addItem(someItem));
    expect(updatedState.cartItems).toEqual([someItem.productId]);
    expect(updatedState.cart).toEqual({
      [someItem.productId]: someItem,
    });
  });

  it('should sum duplicate items', () => {
    const oldQuantity = someItem.quantity;
    const newQuantity = 4;
    const updatedState = cartReducer(
      {
        cartItems: [someItem.productId],
        cart: {
          [someItem.productId]: someItem,
        },
      },
      addItem({
        ...someItem,
        quantity: newQuantity,
      })
    );
    expect(updatedState.cartItems).toEqual([someItem.productId]);
    expect(updatedState.cart[someItem.productId].quantity).toEqual(
      oldQuantity + newQuantity
    );
  });

  it('should allow to remove an item', () => {
    const updatedState = cartReducer(
      {
        cartItems: [someItem.productId],
        cart: {
          [someItem.productId]: someItem,
        },
      },
      removeItem(someItem.productId)
    );
    expect(updatedState.cartItems).toEqual([]);
    expect(updatedState.cart).toEqual({});
  });

  it('should handle removing an absent item', () => {
    const updatedState = cartReducer(state, removeItem(someItem.productId));
    expect(updatedState.cartItems).toEqual([]);
    expect(updatedState.cart).toEqual({});
  });

  it('should allow to update an item', () => {
    const updatedItem = {
      productId: someItem.productId,
      quantity: 200,
    };
    const updatedState = cartReducer(
      {
        cartItems: [someItem.productId],
        cart: {
          [someItem.productId]: someItem,
        },
      },
      updateItemQuantity({
        productId: someItem.productId,
        quantity: 200,
      })
    );
    expect(updatedState.cartItems).toEqual([someItem.productId]);
    expect(updatedState.cart).toEqual({
      [someItem.productId]: updatedItem,
    });
  });

  it('should handle updating an absent item', () => {
    const updatedState = cartReducer(state, updateItemQuantity(someItem));
    expect(updatedState.cartItems).toEqual([]);
    expect(updatedState.cart).toEqual({});
  });
});
