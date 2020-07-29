import {createAction} from '@reduxjs/toolkit';
import {validatePayloadValue} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

export const setSearchHub = createAction('searchHub/set', (payload: string) =>
  validatePayloadValue(
    payload,
    new StringValue({required: true, emptyAllowed: true})
  )
);
