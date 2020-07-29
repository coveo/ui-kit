import {createAction} from '@reduxjs/toolkit';
import {validatePayloadValue} from '../../utils/validate-payload';
import {ArrayValue, StringValue} from '@coveo/bueno';

const nonEmptyString = new StringValue({required: true, emptyAllowed: false});
const nonEmptyArray = new ArrayValue({
  each: nonEmptyString,
  required: true,
});

export const registerFieldsToInclude = createAction(
  'fields/registerFieldsToInclude',
  (payload: string[]) => validatePayloadValue<string[]>(payload, nonEmptyArray)
);
