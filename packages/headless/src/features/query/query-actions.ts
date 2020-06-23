import {createAction} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Update the basic query expression.
 * @param q The new basic query expression (e.g., `acme tornado seeds`).
 */
export const updateQuery = createAction(
  'query/updateQuery',
  (payload: {q: string}) =>
    validatePayloadSchema(payload, {
      q: new StringValue({required: true}),
    })
);
