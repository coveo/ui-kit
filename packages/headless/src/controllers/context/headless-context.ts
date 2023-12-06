import {
  ContextPayload,
  ContextValue,
} from '../../features/context/context-state';
import {CoreEngine} from '../../product-listing.index';
import {
  buildCoreContext,
  Context,
  ContextProps,
  ContextState,
} from '../core/context/headless-core-context';
import {ContextInitialState} from './../core/context/headless-core-context';

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
 */
export function buildContext(
  engine: CoreEngine,
  props?: ContextProps
): Context {
  return buildCoreContext(engine, props);
}
