import type {FacadeResolver, InterfaceHandle} from '@/src/internal/utils/index.js';
import {createUnifiedSearchEndpointThunk} from './unified-search-thunk.js';

export function createUnifiedSearchFacadeResolver(
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle,
  surfaceId: string
): FacadeResolver {
  return (iface) =>
    createUnifiedSearchEndpointThunk(iface, generativeInterface, cartInterface, surfaceId);
}
