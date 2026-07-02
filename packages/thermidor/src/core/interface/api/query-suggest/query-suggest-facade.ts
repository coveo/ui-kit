import type {FacadeResolverFactory} from '@/src/core/interface/utils/interface-types.js';
import {createQuerySuggestThunk} from '@/src/core/internal/api/query-suggest/query-suggest-thunk.js';

export const createQuerySuggestFacadeResolver: FacadeResolverFactory =
  (engine) => (scope) =>
    createQuerySuggestThunk(engine, scope);
