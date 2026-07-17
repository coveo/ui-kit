import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  CommerceInterface,
  FacadeResolver,
  Facades,
} from '@/src/internal/utils/index.js';
import {createCommerceSearchFacadeResolver} from '@/src/internal/api/commerce-search/index.js';
import {createCommerceSuggestionsFacadeResolver} from '@/src/internal/api/commerce-query-suggest/index.js';

const resolvers: Record<Facades['commerce'], FacadeResolver> = {
  search: createCommerceSearchFacadeResolver,
  suggestions: createCommerceSuggestionsFacadeResolver,
};

export class CommerceInterfaceImpl
  extends BaseInterface<'commerce'>
  implements CommerceInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'commerce', resolvers);
  }
}
