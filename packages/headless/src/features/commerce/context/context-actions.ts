import {SchemaValidationError, isNullOrUndefined} from '@coveo/bueno';
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
