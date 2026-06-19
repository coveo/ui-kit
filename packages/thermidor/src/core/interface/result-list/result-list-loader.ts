import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

const resultListLoadedEngines = new WeakSet<FullEngine>();

export const loadResultList = (
  engine: FullEngine,
  interfaceId: string = 'default'
) => {
  if (resultListLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(getOrCreateResultsSlice(interfaceId));

  resultListLoadedEngines.add(engine);
};
