import type {InterfaceCacheRegistry} from '../cache/interface-cache-registry.js';
import type {FullEngine} from '../engine/engine.js';
import type {InterfaceHandle} from './interface-types.js';
import {BaseInterface, getInterfaceInternals} from '../base-interface.js';
import {
  ComposedInterface,
  getComposedInternals,
} from '@/src/public/interfaces/compose.js';

export interface HandleInternals {
  engine: FullEngine;
  stateId: string;
  cacheRegistry: InterfaceCacheRegistry;
}

export function getHandleInternals(handle: InterfaceHandle): HandleInternals {
  if (handle instanceof BaseInterface) {
    const {engine, stateId, cacheRegistry} = getInterfaceInternals(handle);
    return {engine, stateId, cacheRegistry};
  }
  if (handle instanceof ComposedInterface) {
    return getComposedInternals(handle);
  }
  throw new Error(
    'Invalid interface handle: expected a BaseInterface or ComposedInterface instance.'
  );
}
