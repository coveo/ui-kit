import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import {getOrCreateSearchParametersSlice} from '@/src/internal/features/search-parameters/index.js';
import {createSearchFacadeResolver} from '@/src/internal/api/search/index.js';
import {createQuerySuggestFacadeResolver} from '@/src/internal/api/query-suggest/index.js';

const resolverFactories: Record<Facades['search'], FacadeResolverFactory> = {
  search: createSearchFacadeResolver,
  suggestions: createQuerySuggestFacadeResolver,
};

export class SearchInterface extends BaseInterface<'search'> {
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'search', resolverFactories);
  }
}

export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  const iface = new SearchInterface(fullEngine, interfaceId);

  fullEngine.adoptSlice(getOrCreateSearchParametersSlice(iface));

  return iface;
}
