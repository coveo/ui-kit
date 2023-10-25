import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  ContextPayload,
  ContextValue,
} from '../../features/context/context-state';
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
 * @returns A `Context` controller instance.
 */
export function buildContext(
  engine: SearchEngine,
  props?: ContextProps
): Context {
  return buildCoreContext(engine, props);
}
