import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {
  RegisterQuerySetQueryActionCreatorPayload,
  UpdateQuerySetQueryActionCreatorPayload,
  querySetDefinition,
} from '../../query-set/query-set-actions';

export const registerQuerySetQuery = createAction(
  'commerce/querySet/register',
  (payload: RegisterQuerySetQueryActionCreatorPayload) =>
    validatePayload(payload, querySetDefinition)
);

export const updateQuerySetQuery = createAction(
  'commerce/querySet/update',
  (payload: UpdateQuerySetQueryActionCreatorPayload) =>
    validatePayload(payload, querySetDefinition)
);
