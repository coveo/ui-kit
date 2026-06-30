import {State} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {initialSearchBoxState} from '@/src/core/internal/search-box/search-box-slice.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';

const getSearchBoxState = createSelectSlice(
  'default',
  'searchBox',
  initialSearchBoxState
) as (state: State) => typeof initialSearchBoxState;

export const getQuery = createMemoizedStateSelector(
  getSearchBoxState,
  (searchBox) => searchBox.query
);

export {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
