import type {FacadeResolver} from '@/src/internal/utils/index.js';
import {createCommerceSuggestionsThunk} from '@/src/internal/api/commerce-query-suggest/index.js';

export const createCommerceSuggestionsFacadeResolver: FacadeResolver = (
  iface
) => createCommerceSuggestionsThunk(iface);
