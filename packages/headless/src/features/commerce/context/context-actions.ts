import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import {ViewParams} from '../../../api/commerce/commerce-api-params';
import {validatePayload} from '../../../utils/validate-payload';
import {contextDefinition, viewDefinition} from './context-validation';

export interface SetContextPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: SetViewPayload;
}

export const setContext = createAction(
  'commerce/setContext',
  (payload: SetContextPayload) => validatePayload(payload, contextDefinition)
);

export type SetViewPayload = Pick<ViewParams, 'url'>;

export const setView = createAction(
  'commerce/setView',
  (payload: SetViewPayload) => validatePayload(payload, viewDefinition)
);
