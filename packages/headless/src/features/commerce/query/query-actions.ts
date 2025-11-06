import {createAction} from '@reduxjs/toolkit';
import {StringValue} from '../../../utils/bueno-zod.js';
import {validatePayload} from '../../../utils/validate-payload.js';

export interface UpdateQueryPayload {
  /**
   * The new basic query expression (e.g., `red surfboards`).
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
