import type {FacadeResolverFactory} from '@/src/internal/utils/index.js';
import {createCommerceSuggestionsThunk} from '@/src/internal/api/commerce-query-suggest/index.js';

export const createCommerceSuggestionsFacadeResolver: FacadeResolverFactory =
  (engine) => (iface) =>
    createCommerceSuggestionsThunk(engine, iface);
