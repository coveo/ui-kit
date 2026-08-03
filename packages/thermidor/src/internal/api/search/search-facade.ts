import type {FacadeResolver} from '@/src/internal/utils/index.js';
import {createSearchEndpointThunk} from '@/src/internal/api/search/index.js';

export const createSearchFacadeResolver: FacadeResolver = (iface) =>
  createSearchEndpointThunk(iface);
