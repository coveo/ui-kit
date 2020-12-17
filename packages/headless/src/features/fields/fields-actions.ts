import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {ArrayValue} from '@coveo/bueno';

const nonEmptyArray = new ArrayValue({
  each: requiredNonEmptyString,
  required: true,
});

/**
 * Registers the fields to include in the query response.
 * @param payload (string[]) The target fields (e.g., `["field1", "field2"]`).
 */
export const registerFieldsToInclude = createAction(
  'fields/registerFieldsToInclude',
  (payload: string[]) => validatePayload<string[]>(payload, nonEmptyArray)
);
