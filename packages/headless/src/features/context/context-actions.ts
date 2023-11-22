import {isString, ArrayValue, BooleanValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {
  ContextPayload,
  ContextSetting,
  ContextSettingEntry,
  ContextValue,
} from './context-state';

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

export const setContextSettings = createAction(
  'context/settings/set',
  (payload: ContextSetting) => {
    for (const [k, v] of Object.entries(payload)) {
      validatePayload(k, requiredNonEmptyString);
      validateContextSettingPayload(v);
    }
    return {payload};
  }
);

export interface AddContextSettingsActionCreatorPayload {
  /**
   * The name of the key to store the context value in.
   */
  contextKey: string;

  /**
   * The context value.
   */
  settings: ContextSettingEntry;
}

export const addContextSettings = createAction(
  'context/settings/add',
  (payload: AddContextSettingsActionCreatorPayload) => {
    validatePayload(payload.contextKey, requiredNonEmptyString);
    validateContextSettingPayload(payload.settings);
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
function validateContextSettingPayload(v: ContextSettingEntry) {
  validatePayload(v, {
    useForML: new BooleanValue({required: true}),
    useForReporting: new BooleanValue({required: true}),
  });
}
