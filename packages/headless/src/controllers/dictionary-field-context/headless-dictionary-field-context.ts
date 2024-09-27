import {CoreEngine} from '../../app/engine.js';
import {
  addContext,
  removeContext,
  setContext,
} from '../../features/dictionary-field-context/dictionary-field-context-actions.js';
import {dictionaryFieldContextReducer as dictionaryFieldContext} from '../../features/dictionary-field-context/dictionary-field-context-slice.js';
import {DictionaryFieldContextPayload} from '../../features/dictionary-field-context/dictionary-field-context-state.js';
import {DictionaryFieldContextSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  Controller,
  buildController,
} from '../controller/headless-controller.js';

export type {DictionaryFieldContextPayload};

/**
 * The `DictionaryFieldContext` controller allows specifying which [dictionary field](https://docs.coveo.com/en/2036/index-content/about-fields#dictionary-fields) keys to retrieve.
 */
export interface DictionaryFieldContext extends Controller {
  /**
   * Sets the dictionary field context for the query. This replaces any existing context with the new one.
   *
   *  @param context - The dictionary field context to set for the query.
   */
  set(context: DictionaryFieldContextPayload): void;

  /**
   * Adds (or, if one is already present, replaces) a new dictionary field context key-value pair.
   *
   * @param field - The dictionary field name.
   * @param key - The dictionary field key for which to retrieve a value.
   */
  add(field: string, key: string): void;

  /**
   * Removes a dictionary field from the query.
   * @param field - The field to remove.
   */
  remove(field: string): void;

  /**
   * The state of the `DictionaryFieldContext` controller.
   */
  state: DictionaryFieldContextState;
}

export interface DictionaryFieldContextState {
  /**
   * An object holding the dictionary field context fields and keys to retrieve values for.
   */
  values: Record<string, string>;
}

/**
 * Creates a `DictionaryFieldContext` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `DictionaryFieldContext` controller instance.
 */
export function buildDictionaryFieldContext(
  engine: CoreEngine
): DictionaryFieldContext {
  if (!loadReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      return {
        values: getState().dictionaryFieldContext.contextValues,
      };
    },

    set(context: DictionaryFieldContextPayload) {
      dispatch(setContext(context));
    },

    add(field: string, key: string) {
      dispatch(addContext({field, key}));
    },

    remove(field: string) {
      dispatch(removeContext(field));
    },
  };
}

function loadReducers(
  engine: CoreEngine
): engine is CoreEngine<DictionaryFieldContextSection> {
  engine.addReducers({dictionaryFieldContext});
  return true;
}
