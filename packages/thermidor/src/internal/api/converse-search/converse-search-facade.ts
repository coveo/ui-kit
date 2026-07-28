import type {FacadeResolverFactory, InterfaceHandle} from '@/src/internal/utils/index.js';
import {createConverseSearchEndpointThunk} from './converse-search-thunk.js';

export function createConverseSearchFacadeResolver(
  generativeInterface: InterfaceHandle
): FacadeResolverFactory {
  return (engine) => (scope) =>
    createConverseSearchEndpointThunk(engine, scope, generativeInterface);
}
