import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  CommerceInterface,
  FacadeResolverFactory,
  Facades,
} from '@/src/internal/utils/index.js';
import {createCommerceSearchFacadeResolver} from '@/src/internal/api/commerce-search/index.js';
import {createCommerceSuggestionsFacadeResolver} from '@/src/internal/api/commerce-query-suggest/index.js';

const resolverFactories: Record<Facades['commerce'], FacadeResolverFactory> = {
  search: createCommerceSearchFacadeResolver,
  suggestions: createCommerceSuggestionsFacadeResolver,
};

export class CommerceInterfaceImpl
  extends BaseInterface<'commerce'>
  implements CommerceInterface
{
  constructor(
    engine: FullEngine,
    stateId: string,
    customResolvers?: Partial<
      Record<Facades['commerce'], FacadeResolverFactory>
    >
  ) {
    super(engine, stateId, 'commerce', {
      ...resolverFactories,
      ...customResolvers,
    });
  }
}
