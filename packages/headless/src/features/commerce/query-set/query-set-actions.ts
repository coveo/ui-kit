import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {
  RegisterQuerySetQueryActionCreatorPayload,
  UpdateQuerySetQueryActionCreatorPayload,
  querySetDefinition,
} from '../../query-set/query-set-actions';

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
