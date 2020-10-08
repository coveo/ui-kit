import {createAction} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

const querySetDefinition = {
  id: new StringValue({required: true, emptyAllowed: false}),
  query: new StringValue({required: true}),
};
/**
 * Registers a query in the query set.
 * @param id (string) The unique identifier of the target query.
 * @param query (string) The initial basic query expression.
 */
export const registerQuerySetQuery = createAction(
  'querySet/register',
  (payload: {id: string; query: string}) =>
    validatePayloadSchema(payload, querySetDefinition)
);

/**
 * Updates a query in the query set.
 * @param id (string) The unique identifier of the target query.
 * @param query (string) The new basic query expression.
 */
export const updateQuerySetQuery = createAction(
  'querySet/update',
  (payload: {id: string; query: string}) =>
    validatePayloadSchema(payload, querySetDefinition)
);
