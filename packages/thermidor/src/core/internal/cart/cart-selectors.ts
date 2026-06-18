import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialCartState} from './cart-slice.js';

export function createCartSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'cart',
    initialCartState
  );
  return {
    getItems: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.items
    ),
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createCartSelectors>
>();
export function getOrCreateCartSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createCartSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
