import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

const searchBoxLoadedEngines = new WeakSet<FullEngine>();

export const loadSearchBox = (
  engine: FullEngine,
  interfaceId: string = 'default'
) => {
  if (searchBoxLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(getOrCreateSearchBoxSlice(interfaceId));

  searchBoxLoadedEngines.add(engine);
};
