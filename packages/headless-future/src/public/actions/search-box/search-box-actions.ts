import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import {ENGINE, STATE_ID, THUNKS} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

export interface LoadSearchBoxActionsOptions {
  interface: Requires<'search'>;
}

/**
 * Loads the search box actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The search box actions: `setQuery` and `submit`.
 */
export function loadSearchBoxActions(options: LoadSearchBoxActionsOptions) {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const thunks = options.interface[THUNKS].search;

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const actions = getOrCreateSearchBoxActions(stateId);

  return {
    setQuery(payload: {query: string}) {
      engine.mutate(actions.setQuery(payload.query));
    },
    submit() {
      return Promise.all(thunks.map((thunk) => engine.mutate(thunk({engine}))));
    },
  };
}
