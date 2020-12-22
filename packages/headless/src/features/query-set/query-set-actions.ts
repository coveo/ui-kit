import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
  requiredEmptyAllowedString,
} from '../../utils/validate-payload';

const querySetDefinition = {
  id: requiredNonEmptyString,
  query: requiredEmptyAllowedString,
};
/**
 * Registers a query in the query set.
 * @param id (string) The unique identifier of the target query.
 * @param query (string) The initial basic query expression.
 */
export const registerQuerySetQuery = createAction(
  'querySet/register',
  (payload: {id: string; query: string}) =>
    validatePayload(payload, querySetDefinition)
);

/**
 * Updates a query in the query set.
 * @param id (string) The unique identifier of the target query.
 * @param query (string) The new basic query expression.
 */
export const updateQuerySetQuery = createAction(
  'querySet/update',
  (payload: {id: string; query: string}) =>
    validatePayload(payload, querySetDefinition)
);
