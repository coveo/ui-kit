import {RecordValue, Schema} from '@coveo/bueno';
import {CoreEngine} from '../../../app/engine';
import {
  setContext,
  addContext,
  removeContext,
} from '../../../features/context/context-actions';
import {contextReducer as context} from '../../../features/context/context-slice';
import {
  ContextPayload,
  ContextValue,
} from '../../../features/context/context-state';
import {ContextSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export type {ContextPayload, ContextValue};

export interface ContextProps {
  initialState?: ContextInitialState;
}

export interface ContextInitialState {
  values: ContextPayload;
}

const initialStateSchema = new Schema<ContextInitialState>({
  values: new RecordValue({
    options: {required: false},
  }),
});

/**
 * The `Context` controller injects [custom contextual information](https://docs.coveo.com/en/3389/)
 * into the search requests and usage analytics search events sent from a search interface.
 */
export interface Context extends Controller {
  /**
   * Sets the context for the query. This replaces any existing context with the new one.
   *
   *  @param context - The context to set for the query.
   */
  set(context: ContextPayload): void;

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

export function buildCoreContext(
  engine: CoreEngine,
  props: ContextProps = {}
): Context {
  if (!loadContextReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildContext'
  );

  if (initialState.values) {
    dispatch(setContext(initialState.values));
  }

  return {
    ...controller,

    get state() {
      return {
        values: getState().context.contextValues,
      };
    },

    set(context: ContextPayload) {
      dispatch(setContext(context));
    },

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
