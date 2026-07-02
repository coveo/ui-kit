import type {FacadeResolverFactory} from '@/src/core/interface/utils/interface-types.js';
import {createSearchEndpointThunk} from '@/src/core/internal/api/search/search-thunk.js';

export const createSearchFacadeResolver: FacadeResolverFactory =
  (engine) => (scope) =>
    createSearchEndpointThunk(engine, scope);
