import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

export interface GetSearchBoxStateOptions {
  interface: Supports<'search'>;
}

export function getSearchBoxState(options: GetSearchBoxStateOptions) {
  const {engine} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

  const selectors = getOrCreateSearchBoxSelectors(options.interface);

  const stateSelector = createMemoizedStateSelector(
    selectors.getQuery,
    (query) => ({query})
  );

  return {
    get query() {
      return engine.read(stateSelector).query;
    },
    subscribe(callback: (state: {query: string}) => void) {
      return engine.subscribe(stateSelector, callback);
    },
  };
}
