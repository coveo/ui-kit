import {ArrayValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../utils/validate-payload';

export const setCaseContext = createAction(
  'insight/caseContext/set',
  (payload: Record<string, string>) => {
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
