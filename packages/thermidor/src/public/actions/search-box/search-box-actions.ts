import type {Supports} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxActions} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';

export interface LoadSearchBoxActionsOptions {
  interface: Supports<'search'>;
}

/**
 * Loads the search box actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The search box actions: `setQuery` and `submit`.
 */
export function loadSearchBoxActions(options: LoadSearchBoxActionsOptions) {
  const {engine, resolveFacade} = getInterfaceInternals(options.interface);

  engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

  const thunk = resolveFacade('search');

  const actions = getOrCreateSearchBoxActions(options.interface);

  return {
    setQuery(payload: {query: string}) {
      engine.mutate(actions.setQuery(payload.query));
    },
    async submit() {
      await engine.mutate(thunk({engine}));
    },
  };
}
