import {createAction} from '@reduxjs/toolkit';
import {Context, ContextValue} from './context-slice';
import {validatePayloadValue} from '../../utils/validate-payload';
import {StringValue, isString, ArrayValue} from '@coveo/bueno';

const nonEmptyString = new StringValue({required: true, emptyAllowed: false});
const nonEmptyArray = new ArrayValue({
  each: nonEmptyString,
  required: true,
});

const nonEmptyPayload = (contextKey: string, contextValue: ContextValue) => {
  validatePayloadValue(contextKey, nonEmptyString);
  if (isString(contextValue)) {
    validatePayloadValue(contextValue, nonEmptyString);
  } else {
    validatePayloadValue(contextValue, nonEmptyArray);
  }
  return {payload: {contextKey, contextValue}};
};

/**
 * Set the context of the query.
 * @param Context The new context to use.
 */
export const setContext = createAction('context/set', (payload: Context) => {
  for (const [k, v] of Object.entries(payload)) {
    nonEmptyPayload(k, v);
  }
  return {payload};
});

/**
 * Add a new value context value.
 * @param object The key value pair to add to the context.
 */
export const addContext = createAction(
  'context/add',
  (payload: {contextKey: string; contextValue: ContextValue}) =>
    nonEmptyPayload(payload.contextKey, payload.contextValue)
);

/**
 * Add a new value context value.
 * @param object The key value pair to remove from the context.
 */
export const removeContext = createAction('context/remove', (payload: string) =>
  validatePayloadValue(payload, nonEmptyString)
);
