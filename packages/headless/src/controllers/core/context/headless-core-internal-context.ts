import {CoreEngine} from '../../../app/engine.js';
import {
  addContext,
  removeContext,
} from '../../../features/context/context-actions.js';
import {contextReducer as context} from '../../../features/context/context-slice.js';
import {ContextValue} from '../../../features/context/context-state.js';
import {ContextSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  ReservedContextKey,
  UnreservedContextKeyError,
  isReservedContextKey,
} from './headless-context-reserved-keys.js';

/**
 * The `InternalContext` controller injects reserved [custom contextual information](https://docs.coveo.com/en/3389/) key-values.
 * into the search requests and usage analytics search events sent from a search interface.
 * Reserved for strict context.
 * @internal
 */
export interface InternalContext {
  /**
   * Sets or updates a context key-value pair.
   *
   * @param contextKey - The context key.
   * @param contextValue - The context value.
   */
  add(contextKey: string, contextValue: ContextValue): void;

  /**
   * Removes a context key from the query.
   * @param key - The context key to remove.
   */
  remove(key: string): void;
}

/**
 * Creates an `InternalContext` controller instance
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Context` controller properties.
 * @internal
 * @returns a `Context` controller instance.
 */
export function buildInternalCoreContext(engine: CoreEngine): InternalContext {
  if (!loadContextReducers(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  return {
    add(contextKey: ReservedContextKey, contextValue: ContextValue) {
      if (!isReservedContextKey(contextKey)) {
        throw new UnreservedContextKeyError(contextKey);
      }
      dispatch(addContext({contextKey, contextValue}));
    },
    remove(contextKey: ReservedContextKey) {
      if (!isReservedContextKey(contextKey)) {
        throw new UnreservedContextKeyError(contextKey);
      }
      dispatch(removeContext(contextKey));
    },
  };
}

function loadContextReducers(
  engine: CoreEngine
): engine is CoreEngine<ContextSection> {
  engine.addReducers({context});
  return true;
}
