import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload.js';
import {
  querySetDefinition,
  type RegisterQuerySetQueryActionCreatorPayload,
  type UpdateQuerySetQueryActionCreatorPayload,
} from '../../query-set/query-set-actions.js';

export type RegisterQuerySetQueryPayload =
  RegisterQuerySetQueryActionCreatorPayload;
export type UpdateQuerySetQueryPayload =
  UpdateQuerySetQueryActionCreatorPayload;

export const registerQuerySetQuery = createAction(
  'commerce/querySet/register',
  (payload: RegisterQuerySetQueryPayload) =>
    validatePayload(payload, querySetDefinition)
);

export const updateQuerySetQuery = createAction(
  'commerce/querySet/update',
  (payload: UpdateQuerySetQueryPayload) =>
    validatePayload(payload, querySetDefinition)
);
