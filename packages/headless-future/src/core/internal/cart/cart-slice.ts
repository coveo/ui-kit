import {createSlice} from '@reduxjs/toolkit';
import type {
  CartItem,
  CartState,
} from '@/src/core/interface/cart/cart-types.js';
import {setItems, updateItemQuantity} from './cart-actions.js';

export const initialCartState: CartState = {
  items: [],
};

const cartKey = (item: CartItem) =>
  `${item.productId},${item.name},${item.price}`;

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setItems, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(updateItemQuantity, (state, action) => {
      const index = state.items.findIndex(
        (item) => cartKey(item) === cartKey(action.payload)
      );

      if (index === -1) {
        if (action.payload.quantity > 0) {
          state.items.push(action.payload);
        }
        return;
      }

      if (action.payload.quantity <= 0) {
        state.items.splice(index, 1);
        return;
      }

      state.items[index] = action.payload;
    });
  },
  selectors: {
    items: (state) => state.items,
  },
});
