import {createAction} from '@reduxjs/toolkit';
import {BooleanValue, StringValue} from '../../utils/bueno-zod.js';
import {validatePayload} from '../../utils/validate-payload.js';

export interface UpdateQueryActionCreatorPayload {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q?: string;

  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/) in the query.
   */
  enableQuerySyntax?: boolean;
}

export const updateQuery = createAction(
  'query/updateQuery',
  (payload: UpdateQueryActionCreatorPayload) =>
    validatePayload(payload, {
      q: new StringValue(),
      enableQuerySyntax: new BooleanValue(),
    })
);
