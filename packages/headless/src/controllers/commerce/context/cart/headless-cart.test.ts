import {Action} from '@reduxjs/toolkit';
import {
  addItem,
  removeItem,
  setItems,
  updateItemQuantity,
} from '../../../../features/commerce/context/cart/cart-actions';
import {cartReducer} from '../../../../features/commerce/context/cart/cart-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildCart, Cart} from './headless-cart';

describe('headless commerce cart', () => {
  const options = {
    items: [
      {
        productId: 'initial-product-id',
        quantity: 2,
      },
    ],
  };

  const item = {
    productId: 'new-product-id',
    quantity: 1,
  };

  let cart: Cart;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    cart = buildCart(engine, {options});
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  const expectContainActionWithPayload = (
    action: Action,
    payload: string | object
  ) => {
    expect(engine.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: action.type,
          payload:
            typeof payload === 'string'
              ? expect.stringContaining(payload)
              : expect.objectContaining(payload),
        }),
      ])
    );
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      cart: cartReducer,
    });
  });

  it('dispatches #setItems on load if items are present', () => {
    expectContainAction(setItems);
  });

  it('setItems dispatches #setItems', () => {
    cart.setItems([item]);
    expectContainActionWithPayload(setItems, [item]);
  });

  it('addItem dispatches #addItem', () => {
    cart.addItem(item);
    expectContainActionWithPayload(addItem, item);
  });

  it('removeItem dispatches #removeItem', () => {
    cart.removeItem(item.productId);
    expectContainActionWithPayload(removeItem, item.productId);
  });

  it('updateItemQuantity dispatches #updateItemQuantity', () => {
    cart.updateItemQuantity(item.productId, item.quantity);
    expectContainActionWithPayload(updateItemQuantity, item);
  });
});
