import {RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';
import {DictionaryFieldContextPayload} from './dictionary-field-context-state';

export const setContext = createAction(
  'dictionaryFieldContext/set',
  (payload: DictionaryFieldContextPayload) => {
    const objSchema = new RecordValue({options: {required: true}});
    const objError = validatePayload(payload, objSchema).error;

    if (objError) {
      return {payload, error: objError};
    }

    for (const value of Object.values(payload)) {
      const valueError = validatePayload(
        value,
        requiredEmptyAllowedString
      ).error;

      if (valueError) {
        return {payload, error: valueError};
      }
    }

    return {payload};
  }
);

export interface addContextActionCreatorPayload {
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
  (payload: addContextActionCreatorPayload) => {
    const schema = new RecordValue({
      options: {required: true},
      values: {
        field: requiredEmptyAllowedString,
        key: requiredEmptyAllowedString,
      },
    });

    return validatePayload<addContextActionCreatorPayload>(payload, schema);
  }
);

export const removeContext = createAction(
  'dictionaryFieldContext/remove',
  (payload: string) => {
    return validatePayload(payload, requiredEmptyAllowedString);
  }
);
