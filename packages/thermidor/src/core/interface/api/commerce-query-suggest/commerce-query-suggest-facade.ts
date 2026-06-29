import type {FacadeResolverFactory} from '@/src/core/interface/utils/interface-types.js';
import {createCommerceSuggestionsThunk} from '@/src/core/internal/api/commerce-query-suggest/commerce-query-suggest-thunk.js';

export const createCommerceSuggestionsFacadeResolver: FacadeResolverFactory =
  (engine) => (scope) =>
    createCommerceSuggestionsThunk(engine, scope);
