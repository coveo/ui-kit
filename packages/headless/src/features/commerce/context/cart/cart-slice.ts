import {createReducer} from '@reduxjs/toolkit';
import {CartState, getCartInitialState} from './cart-state';
import {addCartItem, removeCartItem, setCart, updateCartItemQuantity} from './cart-actions';
import {ProductParam} from '../../../../api/commerce/commerce-api-params';

const generateId = (product: ProductParam) => [
  product.groupId,
  product.productId,
  product.sku
].filter(Boolean).join('_')

export const cartReducer = createReducer(
  getCartInitialState(),

  (builder) => {
    builder
      .addCase(setCart, (state, {payload}) => {
        const {cart, cartItems} = payload.cart.reduce((acc, item) => {
          const id = generateId(item.product)
          return ({
            cartItems: [...acc.cartItems, id],
            cart: {
              ...acc.cart,
              [id]: item.product
            }
          }) as CartState;
        }, getCartInitialState());

        state.cartItems = cartItems;
        state.cart = cart;
      })
      .addCase(addCartItem, (state, {payload}) => {
        const id = generateId(payload.product)

        state.cartItems = [...state.cartItems, id]
        state.cart[id] = payload
      })
      .addCase(removeCartItem, (state, {payload}) => {
        const id = generateId(payload.product)

        state.cartItems = state.cartItems.filter((itemId) => itemId !== id)
        delete state.cart[id]
      })
      .addCase(updateCartItemQuantity, (state, {payload}) => {
        const id = generateId(payload.product)
        state.cart[id].quantity = payload.quantity
      })
  }
);
