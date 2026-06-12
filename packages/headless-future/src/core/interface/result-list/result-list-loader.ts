import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';

const resultListLoadedEngines = new WeakSet<FullEngine>();

export const loadResultList = (engine: FullEngine) => {
  if (resultListLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(resultsSlice);
  resultListLoadedEngines.add(engine);
};
