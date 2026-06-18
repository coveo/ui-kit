import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  STATE_ID,
  ENGINE,
  THUNK_FACTORIES,
  THUNKS,
} from '@/src/core/interface/utils/symbols.js';
import type {
  Interface,
  Operations,
  EndpointThunkFactory,
  EndpointStateScope,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {createSearchEndpointThunk} from '@/src/core/internal/api/search-endpoint/search-endpoint-thunk.js';
import {createQuerySuggestThunk} from '@/src/core/internal/api/query-suggest/query-suggest-thunk.js';
import {getOrCreateSearchParametersSlice} from '@/src/core/internal/search-parameters/search-parameters-slice.js';

export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): Interface<'search'> {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  const scope: EndpointStateScope = {interfaceId};

  fullEngine.adoptSlice(getOrCreateSearchParametersSlice(interfaceId));

  const factories: Record<Operations['search'], EndpointThunkFactory[]> = {
    search: [createSearchEndpointThunk],
    suggestions: [createQuerySuggestThunk],
  };

  return Object.freeze({
    [KIND]: 'interface' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [THUNK_FACTORIES]: factories,
    [THUNKS]: {
      search: factories.search.map((factory) => factory(fullEngine, scope)),
      suggestions: factories.suggestions.map((factory) =>
        factory(fullEngine, scope)
      ),
    },
  });
}
