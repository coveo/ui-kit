import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import type {ViewParams} from '../../../api/commerce/commerce-api-params.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import type {LocationState} from './context-state.js';
import {
  contextDefinition,
  locationDefinition,
  viewDefinition,
} from './context-validation.js';

export interface SetContextPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: SetViewPayload;
  location?: SetLocationPayload;
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

export type SetLocationPayload = LocationState;

export const setLocation = createAction(
  'commerce/context/setLocation',
  (payload: SetLocationPayload) => validatePayload(payload, locationDefinition)
);
