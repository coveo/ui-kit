import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  TYPE,
  STATE_ID,
  ENGINE,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {getOrCreateSearchParametersSlice} from '@/src/core/internal/search-parameters/search-parameters-slice.js';
import {createSearchFacadeResolver} from '@/src/core/interface/api/search/search-facade.js';
import {createQuerySuggestFacadeResolver} from '@/src/core/interface/api/query-suggest/query-suggest-facade.js';

export type SearchInterface = Interface<'search'>;

export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  fullEngine.adoptSlice(getOrCreateSearchParametersSlice(interfaceId));

  return Object.freeze({
    [KIND]: 'interface' as const,
    [TYPE]: 'search' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [FACADE_RESOLVERS]: {
      search: createSearchFacadeResolver(fullEngine),
      suggestions: createQuerySuggestFacadeResolver(fullEngine),
    },
  });
}
