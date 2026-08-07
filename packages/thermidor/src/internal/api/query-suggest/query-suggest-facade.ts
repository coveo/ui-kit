import type {FacadeResolver} from '@/src/internal/utils/index.js';
import {createQuerySuggestThunk} from '@/src/internal/api/query-suggest/index.js';

export const createQuerySuggestFacadeResolver: FacadeResolver = (iface) =>
  createQuerySuggestThunk(iface);
