import {State} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {initialSearchBoxState} from '@/src/core/internal/search-box/search-box-slice.js';

const getSearchBoxState = (state: State) =>
  state.searchBox ?? initialSearchBoxState;

export const getQuery = createMemoizedStateSelector(
  getSearchBoxState,
  (searchBox) => searchBox.query
);
