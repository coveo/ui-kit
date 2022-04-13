import {
  ContextPayload,
  ContextValue,
} from '../../features/context/context-state';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreContext,
  Context,
  ContextState,
} from '../core/context/headless-core-context';

export type {Context, ContextState, ContextPayload, ContextValue};

/**
 * Creates a `Context` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `Context` controller instance.
 */
export function buildContext(engine: SearchEngine): Context {
  const context = buildCoreContext(engine);

  return {
    ...context,

    get state() {
      return context.state;
    },

    set(contextPayload: ContextPayload) {
      context.set(contextPayload);
    },

    add(contextKey: string, contextValue: ContextValue) {
      context.add(contextKey, contextValue);
    },

    remove(key: string) {
      context.remove(key);
    },
  };
}
