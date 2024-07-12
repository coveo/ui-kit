import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import {ViewParams} from '../../../api/commerce/commerce-api-params';
import {validatePayload} from '../../../utils/validate-payload';
import {contextDefinition, viewDefinition} from './context-validation';

/**
 * @group Actions
 * @category Context
 */
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

/**
 * @group Actions
 * @category Context
 */
export type SetViewPayload = Pick<ViewParams, 'url'>;

export const setView = createAction(
  'commerce/context/setView',
  (payload: SetViewPayload) => validatePayload(payload, viewDefinition)
);
