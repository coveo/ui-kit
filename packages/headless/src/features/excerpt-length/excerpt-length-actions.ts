import {createAction} from '@reduxjs/toolkit';
import {NumberValue} from '../../utils/bueno-zod.js';
import {validatePayload} from '../../utils/validate-payload.js';

export const setExcerptLength = createAction(
  'excerptLength/set',
  (length: number) =>
    validatePayload(length, new NumberValue({min: 0, required: true}))
);
