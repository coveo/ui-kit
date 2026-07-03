import {createSlice} from '@reduxjs/toolkit';
import type {
  CartItem,
  CartState,
} from '@/src/core/interface/cart/cart-types.js';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateCartActions} from './cart-actions.js';

export const initialCartState: CartState = {
  items: [],
};

const cartKey = (item: CartItem) =>
  `${item.productId},${item.name},${item.price}`;

type CartSlice = ReturnType<typeof createCartSlice>;

const CACHE_KEY: CacheKey<CartSlice> = createCacheKey<CartSlice>('cart/slice');

export function createCartSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateCartActions>
) {
  return createSlice({
    name: `${interfaceId}/cart`,
    initialState: initialCartState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setItems, (state, action) => {
        state.items = action.payload;
      });
      builder.addCase(actions.updateItemQuantity, (state, action) => {
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
  });
}

export function getOrCreateCartSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateCartActions(iface);
    return createCartSlice(stateId, actions);
  });
}
