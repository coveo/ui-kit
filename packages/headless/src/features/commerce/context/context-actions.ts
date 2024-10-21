import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import {ViewParams} from '../../../api/commerce/commerce-api-params.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {UserState} from './context-state.js';
import {
  contextDefinition,
  userDefinition,
  viewDefinition,
} from './context-validation.js';

export interface SetContextPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: SetViewPayload;
}

export const setContext = createAction(
  'commerce/context/set',
  (payload: SetContextPayload) => validatePayload(payload, contextDefinition)
);

export type SetViewPayload = Pick<ViewParams, 'url'>;

export const setView = createAction(
  'commerce/context/setView',
  (payload: SetViewPayload) => validatePayload(payload, viewDefinition)
);

export type SetUserPayload = UserState;

export const setUser = createAction(
  'commerce/context/setUser',
  (payload: SetUserPayload) => validatePayload(payload, userDefinition)
);
