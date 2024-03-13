import {SchemaValidationError, isNullOrUndefined} from '@coveo/bueno';
import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {createAction} from '@reduxjs/toolkit';
import {
  UserParams,
  ViewParams,
} from '../../../api/commerce/commerce-api-params';
import {
  serializeSchemaValidationError,
  validatePayload,
} from '../../../utils/validate-payload';
import {
  contextDefinition,
  userDefinition,
  viewDefinition,
} from './context-validation';

export interface SetContextPayload {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  user?: UserParams;
  view: ViewParams;
}

export const setContext = createAction(
  'commerce/setContext',
  (payload: SetContextPayload) => validatePayload(payload, contextDefinition)
);

export type SetUserPayload = UserParams;

export const setUser = createAction(
  'commerce/setUser',
  (payload: SetUserPayload) => {
    if (isNullOrUndefined(payload.userId) && isNullOrUndefined(payload.email)) {
      return {
        payload,
        error: serializeSchemaValidationError(
          new SchemaValidationError(
            'Either userId or email is required'
          ) as Error
        ),
      };
    }

    return validatePayload(payload, userDefinition);
  }
);

export type SetViewPayload = ViewParams;

export const setView = createAction(
  'commerce/setView',
  (payload: SetViewPayload) => validatePayload(payload, viewDefinition)
);
