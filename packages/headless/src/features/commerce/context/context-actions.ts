import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params';
import {validatePayload} from '../../../utils/validate-payload';
import {
  contextDefinition,
  userDefinition,
  viewDefinition,
} from './context-validation';

export interface SetContextActionCreatorPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  user?: UserParams;
  view: ViewParams;
}

export const setContext = createAction(
  'commerce/context/set',
  (payload: SetContextActionCreatorPayload) =>
    validatePayload(payload, contextDefinition)
);

export type SetUserActionCreatorPayload = UserParams;

export const setUser = createAction(
  'commerce/context/setUser',
  (payload: SetUserActionCreatorPayload) =>
    validatePayload(payload, userDefinition)
);

export type SetViewActionCreatorPayload = ViewParams;

export const setView = createAction(
  'commerce/context/setView',
  (payload: SetViewActionCreatorPayload) =>
    validatePayload(payload, viewDefinition)
);
