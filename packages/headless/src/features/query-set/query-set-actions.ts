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

export interface RegisterQuerySetQueryActionCreatorPayload {
  /**
   * The unique identifier of the target query.
   */
  id: string;

  /**
   * The initial basic query expression.
   */
  query: string;
}

/**
 * Registers a query in the query set.
 * @param id (string) The unique identifier of the target query.
 * @param query (string) The initial basic query expression.
 */
export const registerQuerySetQuery = createAction(
  'querySet/register',
  (payload: RegisterQuerySetQueryActionCreatorPayload) =>
    validatePayload(payload, querySetDefinition)
);

export interface UpdateQuerySetQueryActionCreatorPayload {
  /**
   * The unique identifier of the target query.
   */
  id: string;

  /**
   * The new basic query expression.
   */
  query: string;
}

/**
 * Updates a query in the query set.
 * @param id (string) The unique identifier of the target query.
 * @param query (string) The new basic query expression.
 */
export const updateQuerySetQuery = createAction(
  'querySet/update',
  (payload: UpdateQuerySetQueryActionCreatorPayload) =>
    validatePayload(payload, querySetDefinition)
);
