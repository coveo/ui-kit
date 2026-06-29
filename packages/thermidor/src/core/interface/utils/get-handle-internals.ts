import type {FullEngine} from '../engine/engine.js';
import type {Facades, InterfaceType, Supports} from './interface-types.js';
import {BaseInterface, getInterfaceInternals} from '../base-interface.js';
import {
  ComposedInterface,
  getComposedInternals,
} from '@/src/public/interfaces/compose.js';

export interface HandleInternals {
  engine: FullEngine;
  stateId: string;
}

export function getHandleInternals<F extends Facades[InterfaceType]>(
  handle: Supports<F>
): HandleInternals {
  if (handle instanceof BaseInterface) {
    const {engine, stateId} = getInterfaceInternals(handle);
    return {engine, stateId};
  }
  if (handle instanceof ComposedInterface) {
    return getComposedInternals(handle);
  }
  throw new Error(
    'Invalid interface handle: expected a BaseInterface or ComposedInterface instance.'
  );
}
