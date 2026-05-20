import {SearchEndpointFacade} from '@/src/core/interface/api/search-endpoint/search-endpoint-facade.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import type {CoveoSearchEndpointResponse} from '../api/search-endpoint/search-endpoint-types.js';
import {setResults} from './result-list-mutators.js';
import type {SearchResult} from './result-list-types.js';

const mapSearchEndpointResponseToResultList = (
  response: CoveoSearchEndpointResponse
) => {
  const searchResults: SearchResult[] = response.results.map((result) => ({
    id: result.uri,
    title: result.title,
    uri: result.uri,
    excerpt: result.excerpt ?? '',
  }));

  return searchResults;
};

const resultListLoadedEngines = new WeakSet<FullEngine>();

export const loadResultList = (engine: FullEngine) => {
  if (resultListLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(resultsSlice);

  const searchEndpointFacade = SearchEndpointFacade.getInstance(engine);
  searchEndpointFacade.onResponse((response) => {
    engine.mutate(setResults(mapSearchEndpointResponseToResultList(response)));
  });

  resultListLoadedEngines.add(engine);
};
