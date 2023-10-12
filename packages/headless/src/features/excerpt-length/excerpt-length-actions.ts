import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export const setExcerptLength = createAction(
  'excerptLength/set',
  (length: number) =>
    validatePayload(length, new NumberValue({min: 0, required: true}))
);
