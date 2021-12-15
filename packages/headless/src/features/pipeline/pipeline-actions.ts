import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

export const setPipeline = createAction('pipeline/set', (payload: string) =>
  validatePayload(
    payload,
    new StringValue({required: true, emptyAllowed: true})
  )
);
