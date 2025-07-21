import type {CoreEngine} from '../../app/engine.js';
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
  ContextState,
  ContextPayload,
  ContextValue,
  ContextInitialState,
  ContextProps,
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
  engine: CoreEngine,
  props?: ContextProps
): Context {
  return buildCoreContext(engine, props);
}
