import {RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';
import {DictionaryFieldContextPayload} from './dictionary-field-context-state';

export const setDictionaryFieldContext = createAction(
  'dictionaryFieldContext/set',
  (payload: DictionaryFieldContextPayload) => {
    const objSchema = new RecordValue({options: {required: true}});
    const objError = validatePayload(payload, objSchema).error;

    if (objError) {
      return {payload, error: objError};
    }

    for (const [_, value] of Object.entries(payload)) {
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

export const addDictionaryFieldContext = createAction(
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

export const removeDictionaryFieldContext = createAction(
  'dictionaryFieldContext/remove',
  (payload: string) => {
    return validatePayload(payload, requiredEmptyAllowedString);
  }
);
