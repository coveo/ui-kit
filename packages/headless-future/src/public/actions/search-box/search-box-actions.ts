import {
  Engine,
  FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import {loadSearchBox} from '@/src/core/index.js';
import * as searchBoxMutators from '@/src/core/interface/search-box/search-box-mutators.js';

const getInitializedEngine = (engine: Engine): FullEngine => {
  const fullEngine = getFullEngine(engine);
  loadSearchBox(fullEngine);
  return fullEngine;
};

export const loadSearchBoxActions = (engine: Engine): SearchBoxActions => {
  const fullEngine = getInitializedEngine(engine);

  return {
    setQuery: (query: string) => {
      fullEngine.mutate(searchBoxMutators.setQuery(query));
    },
  };
};

export const setQuery = (engine: Engine) => {
  const fullEngine = getInitializedEngine(engine);

  return (query: string) => {
    fullEngine.mutate(searchBoxMutators.setQuery(query));
  };
};

interface SearchBoxActions {
  setQuery: (query: string) => void;
}
