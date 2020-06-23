import {createAction} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

const querySetDefinition = {
  id: new StringValue({required: true, emptyAllowed: false}),
  query: new StringValue({required: true}),
};
/**
 * Register a query in the query set.
 * @param id The unique identifier of the target query.
 * @param query The initial basic query expression.
 */
export const registerQuerySetQuery = createAction(
  'querySet/register',
  (payload: {id: string; query: string}) =>
    validatePayloadSchema(payload, querySetDefinition)
);

/**
 * Update a query in the query set.
 * @param id The unique identifier of the target query.
 * @param query The updated basic query expression.
 */
export const updateQuerySetQuery = createAction(
  'querySet/update',
  (payload: {id: string; query: string}) =>
    validatePayloadSchema(payload, querySetDefinition)
);
