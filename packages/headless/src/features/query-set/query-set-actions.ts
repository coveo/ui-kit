import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';

export const querySetDefinition = {
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

export const updateQuerySetQuery = createAction(
  'querySet/update',
  (payload: UpdateQuerySetQueryActionCreatorPayload) =>
    validatePayload(payload, querySetDefinition)
);
