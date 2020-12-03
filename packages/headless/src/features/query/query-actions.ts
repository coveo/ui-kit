import {createAction} from '@reduxjs/toolkit';
import {validateActionPayload} from '../../utils/validate-payload';
import {BooleanValue, StringValue} from '@coveo/bueno';
import {QueryState} from './query-state';

/**
 * Updates the basic query expression.
 * @param q (string) The new basic query expression (e.g., `acme tornado seeds`).
 */
export const updateQuery = createAction(
  'query/updateQuery',
  (payload: Partial<QueryState>) =>
    validateActionPayload(payload, {
      q: new StringValue(),
      enableQuerySyntax: new BooleanValue(),
    })
);
