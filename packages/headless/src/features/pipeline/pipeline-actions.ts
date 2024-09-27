import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export const setPipeline = createAction('pipeline/set', (payload: string) =>
  validatePayload(
    payload,
    new StringValue({required: true, emptyAllowed: true})
  )
);
