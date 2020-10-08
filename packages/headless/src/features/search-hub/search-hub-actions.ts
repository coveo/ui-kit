import {createAction} from '@reduxjs/toolkit';
import {validatePayloadValue} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Sets the search hub.
 * @param payload (string) The new search hub (may be empty).
 */
export const setSearchHub = createAction('searchHub/set', (payload: string) =>
  validatePayloadValue(
    payload,
    new StringValue({required: true, emptyAllowed: true})
  )
);
