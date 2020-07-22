import {createAction} from '@reduxjs/toolkit';
import {validatePayloadValue} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

export const setPipeline = createAction('pipeline/set', (payload: string) =>
  validatePayloadValue(
    payload,
    new StringValue({required: true, emptyAllowed: true})
  )
);
