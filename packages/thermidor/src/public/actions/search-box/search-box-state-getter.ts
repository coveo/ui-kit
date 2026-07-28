import type {Supports} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxSelectors} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';

export interface GetSearchBoxStateOptions {
  interface: Supports<'search'>;
}

export function getSearchBoxState(options: GetSearchBoxStateOptions) {
  const {engine} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

  const selectors = getOrCreateSearchBoxSelectors(options.interface);

  const stateSelector = createMemoizedStateSelector(selectors.getQuery, (query) => ({query}));

  return {
    get query() {
      return engine.read(stateSelector).query;
    },
    subscribe(callback: (state: {query: string}) => void) {
      return engine.subscribe(stateSelector, callback);
    },
  };
}
