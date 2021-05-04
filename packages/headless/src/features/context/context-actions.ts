import {createAction} from '@reduxjs/toolkit';
import {ContextPayload, ContextValue} from './context-state';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {isString, ArrayValue} from '@coveo/bueno';

const nonEmptyArray = new ArrayValue({
  each: requiredNonEmptyString,
  required: true,
});

const nonEmptyPayload = (contextKey: string, contextValue: ContextValue) => {
  validatePayload(contextKey, requiredNonEmptyString);
  if (isString(contextValue)) {
    validatePayload(contextValue, requiredNonEmptyString);
  } else {
    validatePayload(contextValue, nonEmptyArray);
  }
  return {payload: {contextKey, contextValue}};
};

/**
 * Sets the query context.
 * @param payload (Context) The new context (e.g., {age: "18-35"}).
 */
export const setContext = createAction(
  'context/set',
  (payload: ContextPayload) => {
    for (const [k, v] of Object.entries(payload)) {
      nonEmptyPayload(k, v);
    }
    return {payload};
  }
);

export interface AddContextActionCreatorPayload {
  /**
   * The name of the key to store the context value in.
   */
  contextKey: string;

  /**
   * The context value.
   */
  contextValue: ContextValue;
}

/**
 * Adds a new context value.
 * @param payload ({contextKey: string; contextValue: ContextValue}) The key-value pair to add to the context (e.g., `{contextKey: "age", contextValue: "18-35"}`).
 */
export const addContext = createAction(
  'context/add',
  (payload: AddContextActionCreatorPayload) =>
    nonEmptyPayload(payload.contextKey, payload.contextValue)
);

/**
 * Removes a context key-value pair.
 * @param key (string) The key to remove from the context (e.g., `"age"`).
 */
export const removeContext = createAction('context/remove', (payload: string) =>
  validatePayload(payload, requiredNonEmptyString)
);
