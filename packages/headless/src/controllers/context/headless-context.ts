import {Engine} from '../../app/engine';
import {buildController, Controller} from '../controller/headless-controller';
import {
  ContextPayload,
  ContextValue,
} from '../../features/context/context-state';
import {
  setContext,
  addContext,
  removeContext,
} from '../../features/context/context-actions';
import {ContextSection} from '../../state/state-sections';

export {ContextPayload, ContextValue};

/**
 * The `Context` controller injects custom contextual information into the search requests and usage analytics search events sent from a search interface.
 *
 * See [Sending Custom Context Information](https://docs.coveo.com/en/399/).
 */
export interface Context extends Controller {
  /**
   * Set the context for the query. Replace any existing context by the new one.
   *
   *  @param ctx - The context to set in the query.
   */
  set(ctx: ContextPayload): void;

  /**
   * Add, or replace if already present, a new context key and value pair.
   *
   * @param contextKey - The context key to add.
   * @param contextValue - The context value to add.
   */
  add(contextKey: string, contextValue: ContextValue): void;

  /**
   * Remove a context key from the query.
   * @param key - The context key to remove.
   */
  remove(key: string): void;

  /**
   * The state of the `Context` controller.
   */
  state: ContextState;
}

export interface ContextState {
  /**
   * An object holding the context keys and their values.
   */
  values: Record<string, ContextValue>;
}

/**
 * Creates a `Context` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `Context` controller instance.
 */
export function buildContext(engine: Engine<ContextSection>): Context {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      return {
        values: engine.state.context.contextValues,
      };
    },

    set(ctx: ContextPayload) {
      dispatch(setContext(ctx));
    },

    add(contextKey: string, contextValue: ContextValue) {
      dispatch(addContext({contextKey, contextValue}));
    },

    remove(key: string) {
      dispatch(removeContext(key));
    },
  };
}
