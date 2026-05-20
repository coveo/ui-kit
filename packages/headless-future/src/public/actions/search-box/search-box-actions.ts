import {
  Engine,
  FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {loadSearchBox} from '@/src/core/index.js';
import * as searchBoxMutators from '@/src/core/interface/search-box/search-box-mutators.js';

/**
 * Loads the search box actions.
 * @param engine - The engine to use for the actions.
 * @returns The search box actions.
 */
export const loadSearchBoxActions = (engine: Engine): SearchBoxActions => {
  const fullEngine = getInitializedEngine(engine);

  return {
    setQuery: (payload: SearchBoxSetQueryPayload) => {
      fullEngine.mutate(searchBoxMutators.setQuery(payload.query));
    },
  };
};

/**
 * Gets a curried function that sets the query for the search box.
 * @param engine - The engine to use for the action.
 * @returns A function that sets the query string.
 */
export const setQuery = (engine: Engine): SearchBoxActions['setQuery'] => {
  const fullEngine = getInitializedEngine(engine);

  return (payload: SearchBoxSetQueryPayload) => {
    fullEngine.mutate(searchBoxMutators.setQuery(payload.query));
  };
};

interface SearchBoxSetQueryPayload {
  query: string;
}

interface SearchBoxActions {
  setQuery: (payload: SearchBoxSetQueryPayload) => void;
}

const getInitializedEngine = (engine: Engine): FullEngine => {
  const fullEngine = getFullEngine(engine);
  loadSearchBox(fullEngine);
  return fullEngine;
};
