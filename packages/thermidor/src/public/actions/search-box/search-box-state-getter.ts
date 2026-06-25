import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

export interface GetSearchBoxStateOptions {
  interface: Supports<'search'>;
}

export function getSearchBoxState(options: GetSearchBoxStateOptions) {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const selectors = getOrCreateSearchBoxSelectors(stateId);

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
