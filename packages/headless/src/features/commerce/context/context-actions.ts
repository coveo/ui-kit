import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params';
import {
  contextDefinition,
  userDefinition,
  viewDefinition,
} from './context-validation';

export interface SetContextPayload {
  trackingId: string;
  language: string;
  currency: string;
  clientId: string;
  user?: UserParams;
  view: ViewParams;
}

export const setContext = createAction(
  'commerce/setContext',
  (payload: SetContextPayload) => validatePayload(payload, contextDefinition)
);

type SetUserPayload = UserParams;

export const setUser = createAction(
  'commerce/setUser',
  (payload: SetUserPayload) => validatePayload(payload, userDefinition)
);

type SetViewPayload = ViewParams;

export const setView = createAction(
  'commerce/setView',
  (payload: SetViewPayload) => validatePayload(payload, viewDefinition)
);
