import type {FacadeResolver, InterfaceHandle} from '@/src/internal/utils/index.js';
import {createConverseSearchEndpointThunk} from './converse-search-thunk.js';

export function createConverseSearchFacadeResolver(
  generativeInterface: InterfaceHandle
): FacadeResolver {
  return (iface) => createConverseSearchEndpointThunk(iface, generativeInterface);
}
