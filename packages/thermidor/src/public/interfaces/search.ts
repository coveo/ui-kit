import {BaseInterface} from '@/src/core/interface/base-interface.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {getOrCreateSearchParametersSlice} from '@/src/core/internal/search-parameters/search-parameters-slice.js';
import {createSearchFacadeResolver} from '@/src/core/interface/api/search/search-facade.js';
import {createQuerySuggestFacadeResolver} from '@/src/core/interface/api/query-suggest/query-suggest-facade.js';

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
