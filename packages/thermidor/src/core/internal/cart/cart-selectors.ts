import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
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

export const getOrCreateCartSelectors = SingletonFactory(createCartSelectors);
