import type {CoreEngine} from '../../app/engine.js';
import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureCoreEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {
  ContextPayload,
  ContextValue,
} from '../../features/context/context-state.js';
import type {ContextInitialState} from './../core/context/headless-core-context.js';
import {
  buildCoreContext,
  type Context,
  type ContextProps,
  type ContextState,
} from '../core/context/headless-core-context.js';

export type {
  Context,
  ContextInitialState,
  ContextPayload,
  ContextProps,
  ContextState,
  ContextValue,
};

/**
 * Creates a `Context` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Context` controller properties.
 *
 * @returns A `Context` controller instance.
 *
 * @object Controllers
 * @category Context
 */
export function buildContext(
  engine: CoreEngine | FrankensteinEngine,
  props?: ContextProps
): Context {
  return buildCoreContext(ensureCoreEngine(engine), props);
}
