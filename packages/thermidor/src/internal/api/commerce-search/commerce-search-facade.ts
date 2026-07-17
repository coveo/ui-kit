import type {FacadeResolverFactory} from '@/src/internal/utils/index.js';
import {createCommerceSearchEndpointThunk} from './commerce-search-thunk.js';

export const createCommerceSearchFacadeResolver: FacadeResolverFactory =
  (engine) => (iface) =>
    createCommerceSearchEndpointThunk(engine, iface);
