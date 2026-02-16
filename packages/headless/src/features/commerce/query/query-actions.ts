import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload.js';

export interface UpdateQueryPayload {
  /**
   * The new basic query expression (for example, `red surfboards`).
   */
  query?: string;
}

export const updateQuery = createAction(
  'commerce/query/update',
  (payload: UpdateQueryPayload) =>
    validatePayload(payload, {
      query: new StringValue(),
    })
);
