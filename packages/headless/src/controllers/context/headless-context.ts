import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {
  Context as ContextPayload,
  ContextValue,
} from '../../features/context/context-state';
import {
  ContextActions,
} from '../../features/context/context-actions';
import {ContextSection} from '../../state/state-sections';

/**
 * The `Context` controller injects custom contextual information into the search requests and usage analytics search events sent from a search interface.
 *
 * See [Sending Custom Context Information](https://docs.coveo.com/en/399/).
 */
export type Context = ReturnType<typeof buildContext>;
export type ContextState = Context['state'];

export const buildContext = (engine: Engine<ContextSection>) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,
    get state() {
      return {
        values: engine.state.context.contextValues,
      };
    },

    /**
     * Set the context for the query. Replace any existing context by the new one.
     *  @param ctx The context to set in the query.
     */
    set(ctx: ContextPayload) {
      dispatch(ContextActions.setContext(ctx));
    },

    /**
     * Add, or replace if already present, a new context key and value pair.
     * @param contextKey The context key to add.
     * @param contextValue The context value to add.
     */
    add(contextKey: string, contextValue: ContextValue) {
      dispatch(ContextActions.addContext({contextKey, contextValue}));
    },

    /**
     * Remove a context key from the query.
     * @param key The context key to remove.
     */
    remove(key: string) {
      dispatch(ContextActions.removeContext(key));
    },
  };
};
