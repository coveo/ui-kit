import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

export interface LoadSearchBoxActionsOptions {
  interface: Supports<'search'>;
}

/**
 * Loads the search box actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The search box actions: `setQuery` and `submit`.
 */
export function loadSearchBoxActions(options: LoadSearchBoxActionsOptions) {
  const {engine} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

  const thunks = options.interface.resolveFacades('search');

  const actions = getOrCreateSearchBoxActions(options.interface);

  return {
    setQuery(payload: {query: string}) {
      engine.mutate(actions.setQuery(payload.query));
    },
    submit() {
      return Promise.all(thunks.map((thunk) => engine.mutate(thunk({engine}))));
    },
  };
}
