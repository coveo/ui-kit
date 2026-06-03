import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export interface UpdateQueryActionCreatorPayload {
  /**
   * The basic query expression (for example, `acme tornado seeds`).
   */
  q?: string;

  /**
   * Whether to interpret advanced [Coveo query syntax](https://docs.coveo.com/en/1552/) in the query.
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
