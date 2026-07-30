import type {FacadeResolverFactory} from '@/src/internal/utils/index.js';
import {createSearchEndpointThunk} from '@/src/internal/api/search/index.js';

export const createSearchFacadeResolver: FacadeResolverFactory = (engine) => (scope) =>
  createSearchEndpointThunk(engine, scope);
