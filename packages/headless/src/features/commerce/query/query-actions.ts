import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';

export interface UpdateQueryActionCreatorPayload {
  /**
   * The new basic query expression (e.g., `red surfboards`).
   */
  query?: string;
}

export const updateQuery = createAction(
  'commerce/query/updateQuery',
  (payload: UpdateQueryActionCreatorPayload) =>
    validatePayload(payload, {
      query: new StringValue(),
    })
);
