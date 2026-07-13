import type {InterfaceCacheRegistry} from './interface-cache-registry.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  EndpointThunk,
  Facades,
  InterfaceHandle,
  InterfaceType,
} from './interface-types.js';
import {BaseInterface, getInterfaceInternals} from './base-interface.js';
import {
  ComposedInterfaceImpl,
  getComposedInternals,
} from '@/src/public/interfaces/compose.js';

export interface HandleInternals {
  engine: FullEngine;
  stateId: string;
  cacheRegistry: InterfaceCacheRegistry;
  resolveFacades(
    facade: Facades[InterfaceType],
    composedInterface?: InterfaceHandle
  ): EndpointThunk[];
}

export function getHandleInternals(handle: InterfaceHandle): HandleInternals {
  if (handle instanceof BaseInterface) {
    const {engine, stateId, cacheRegistry, resolveFacades} =
      getInterfaceInternals(handle);
    return {engine, stateId, cacheRegistry, resolveFacades};
  }
  if (handle instanceof ComposedInterfaceImpl) {
    return getComposedInternals(handle);
  }
  throw new Error(
    'Invalid interface handle: expected a BaseInterface or ComposedInterfaceImpl instance.'
  );
}
