import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import * as searchBoxMutators from '@/src/core/interface/search-box/search-box-mutators.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';

type MutatorToAction<T> = T extends (...args: infer A) => any
  ? (...args: A) => void
  : never;

type MutatorsToActions<T> = {
  [K in keyof T]: MutatorToAction<T[K]>;
};
const loadedEngine = new WeakSet<Engine>();

export const loadSearchBoxActions = (
  engine: Engine
): MutatorsToActions<typeof searchBoxMutators> => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(searchBoxSlice);
  loadedEngine.add(engine);
  return {
    setQuery: (query: string) => {
      fullEngine.mutate(searchBoxMutators.setQuery(query));
    },
  };
};

export const setQuery = (engine: Engine) => {
  if (!loadedEngine.has(engine)) {
    const fullEngine = getFullEngine(engine);
    fullEngine.adoptSlice(searchBoxSlice);
    loadedEngine.add(engine);
  }

  return (query: string) => {
    const fullEngine = getFullEngine(engine);
    fullEngine.mutate(searchBoxMutators.setQuery(query));
  };
};
