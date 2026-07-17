import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
  SearchInterface,
} from '@/src/internal/utils/index.js';
import {createSearchFacadeResolver} from '@/src/internal/api/search/index.js';
import {createQuerySuggestFacadeResolver} from '@/src/internal/api/query-suggest/index.js';
import {getOrCreateSearchParametersSlice} from '@/src/internal/features/search-parameters/index.js';

const resolverFactories: Record<Facades['search'], FacadeResolverFactory> = {
  search: createSearchFacadeResolver,
  suggestions: createQuerySuggestFacadeResolver,
};

export class SearchInterfaceImpl
  extends BaseInterface<'search'>
  implements SearchInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'search', resolverFactories);
    engine.adoptSlice(getOrCreateSearchParametersSlice(this));
  }
}
