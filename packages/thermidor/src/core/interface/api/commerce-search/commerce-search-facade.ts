import type {FacadeResolverFactory} from '@/src/core/interface/utils/interface-types.js';
import {createCommerceSearchEndpointThunk} from '@/src/core/internal/api/search/commerce-search-thunk.js';

export const createCommerceSearchFacadeResolver: FacadeResolverFactory =
  (engine) => (scope) =>
    createCommerceSearchEndpointThunk(engine, scope);
