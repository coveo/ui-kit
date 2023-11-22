import {CoreEngine} from '../../../app/engine';
import {
  addContext,
  removeContext,
} from '../../../features/context/context-actions';
import {contextReducer as context} from '../../../features/context/context-slice';
import {ContextValue} from '../../../features/context/context-state';
import {ContextSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';

/**
 * The `InternalContext` controller injects [custom contextual information](https://docs.coveo.com/en/3389/)
 * into the search requests and usage analytics search events sent from a search interface.
 * Reserved for strict context.
 * @internal
 */
export interface InternalContext {
  /**
   * Adds (or, if one is already present, replaces) a new context key-value pair.
   *
   * @param contextKey - The context key to add.
   * @param contextValue - The context value to add.
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
    add(contextKey: string, contextValue: ContextValue) {
      dispatch(addContext({contextKey, contextValue}));
    },
    remove(key: string) {
      dispatch(removeContext(key));
    },
  };
}

function loadContextReducers(
  engine: CoreEngine
): engine is CoreEngine<ContextSection> {
  engine.addReducers({context});
  return true;
}
