import {ArrayValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload.js';
import type {DictionaryFieldContextPayload} from './dictionary-field-context-state.js';

export const setContext = createAction(
  'dictionaryFieldContext/set',
  (payload: DictionaryFieldContextPayload) => {
    const objSchema = new RecordValue({options: {required: true}});
    const objError = validatePayload(payload, objSchema).error;

    if (objError) {
      return {payload, error: objError};
    }

    const values = Object.values(payload);
    const valueSchema = new ArrayValue({each: requiredEmptyAllowedString});
    const valuesError = validatePayload(values, valueSchema).error;

    if (valuesError) {
      return {payload, error: valuesError};
    }

    return {payload};
  }
);

export interface AddDictionaryFieldContextActionCreatorPayload {
  /**
   * The name of the dictionary field.
   */
  field: string;

  /**
   * The dictionary field key to return the value of.
   */
  key: string;
}

export const addContext = createAction(
  'dictionaryFieldContext/add',
  (payload: AddDictionaryFieldContextActionCreatorPayload) => {
    const schema = new RecordValue({
      options: {required: true},
      values: {
        field: requiredEmptyAllowedString,
        key: requiredEmptyAllowedString,
      },
    });

    return validatePayload<AddDictionaryFieldContextActionCreatorPayload>(
      payload,
      schema
    );
  }
);

export const removeContext = createAction(
  'dictionaryFieldContext/remove',
  (payload: string) => {
    return validatePayload(payload, requiredEmptyAllowedString);
  }
);
