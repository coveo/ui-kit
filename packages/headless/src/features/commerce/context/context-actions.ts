import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import type {ViewParams} from '../../../api/commerce/commerce-api-params.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import type {CustomContextState} from './context-state.js';
import {contextDefinition, customDefinition, viewDefinition} from './context-validation.js';

export interface SetContextPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: SetViewPayload;
  custom?: CustomContextState;
}

export const setContext = createAction('commerce/context/set', (payload: SetContextPayload) =>
  validatePayload(payload, contextDefinition)
);

export type SetViewPayload = Pick<ViewParams, 'url'>;

export const setView = createAction('commerce/context/setView', (payload: SetViewPayload) =>
  validatePayload(payload, viewDefinition)
);

export type SetCustomPayload = CustomContextState | undefined;

export const setCustom = createAction('commerce/context/setCustom', (payload: SetCustomPayload) =>
  validatePayload({custom: payload}, customDefinition)
);
