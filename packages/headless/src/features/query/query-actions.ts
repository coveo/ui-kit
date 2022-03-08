import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';

export interface UpdateQueryActionCreatorPayload {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q?: string;

  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators) in the query.
   */
  enableQuerySyntax?: boolean;
  /**
   * Number of times the query has been executed in a row
   */
  calls?: number;
}

export const updateQuery = createAction(
  'query/updateQuery',
  (payload: UpdateQueryActionCreatorPayload) =>
    validatePayload(payload, {
      q: new StringValue(),
      enableQuerySyntax: new BooleanValue(),
      calls: new NumberValue(),
    })
);
