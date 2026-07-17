import type {FacadeResolverFactory} from '@/src/internal/utils/index.js';
import {createQuerySuggestThunk} from '@/src/internal/api/query-suggest/index.js';

export const createQuerySuggestFacadeResolver: FacadeResolverFactory =
  (engine) => (iface) =>
    createQuerySuggestThunk(engine, iface);
