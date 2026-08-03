import type {FacadeResolver} from '@/src/internal/utils/index.js';
import {createCommerceSearchEndpointThunk} from './commerce-search-thunk.js';

export const createCommerceSearchFacadeResolver: FacadeResolver = (iface) =>
  createCommerceSearchEndpointThunk(iface);
