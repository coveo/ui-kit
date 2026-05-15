import {searchApiSlice} from '@/src/core/internal/api/search-api/search-api-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

export const loadSearchEndpoint = (engine: FullEngine) => {
  engine.adoptSlice(searchApiSlice);
};
