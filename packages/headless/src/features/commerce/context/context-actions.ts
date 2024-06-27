import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import {ViewParams} from '../../../api/commerce/commerce-api-params';
import {validatePayload} from '../../../utils/validate-payload';
import {contextDefinition, viewDefinition} from './context-validation';

export interface SetContextActionCreatorPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: SetViewActionCreatorPayload;
}

export const setContext = createAction(
  'commerce/context/set',
  (payload: SetContextActionCreatorPayload) =>
    validatePayload(payload, contextDefinition)
);

export type SetViewActionCreatorPayload = Pick<ViewParams, 'url'>;

export const setView = createAction(
  'commerce/context/setView',
  (payload: SetViewActionCreatorPayload) =>
    validatePayload(payload, viewDefinition)
);
