import {ArrayValue, isString} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import type {ContextPayload, ContextValue} from './context-state.js';

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

export const addContext = createAction(
  'context/add',
  (payload: AddContextActionCreatorPayload) =>
    nonEmptyPayload(payload.contextKey, payload.contextValue)
);

export const removeContext = createAction('context/remove', (payload: string) =>
  validatePayload(payload, requiredNonEmptyString)
);
