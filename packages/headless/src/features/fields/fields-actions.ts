import {createAction} from '@reduxjs/toolkit';
import {validateActionPayload} from '../../utils/validate-payload';
import {ArrayValue, StringValue} from '@coveo/bueno';

const nonEmptyString = new StringValue({required: true, emptyAllowed: false});
const nonEmptyArray = new ArrayValue({
  each: nonEmptyString,
  required: true,
});

/**
 * Registers the fields to include in the query response.
 * @param payload (string[]) The target fields (e.g., `["field1", "field2"]`).
 */
export const registerFieldsToInclude = createAction(
  'fields/registerFieldsToInclude',
  (payload: string[]) => validateActionPayload<string[]>(payload, nonEmptyArray)
);
