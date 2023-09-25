import { createAction } from '@reduxjs/toolkit';
import {nonEmptyString, requiredNonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {UserParams, ViewParams} from '../../../api/commerce/commerce-api-params';
import { RecordValue } from '@coveo/bueno';

export interface SetContextPayload {
  trackingId?: string;
  language?: string;
  currency?: string;
  clientId?: string;
  user?: UserParams;
  view: ViewParams;
}

export const setContext = createAction(
  'commerce/setContext',
  (payload: SetContextPayload) =>
    validatePayload(payload, {
      trackingId: nonEmptyString,
      language: nonEmptyString,
      currency: nonEmptyString,
      clientId: nonEmptyString,
      user: new RecordValue({
        values: {
          userId: nonEmptyString,
          email: nonEmptyString,
          userIp: nonEmptyString,
          userAgent: nonEmptyString,
        },
      }),
      view: new RecordValue({
        options: { required: true },
        values: {
          url: requiredNonEmptyString
        }
      })
    })
);

const nonEmptyStringAction = (type: string) => createAction(
  type,
  (payload: string) => validatePayload(payload, nonEmptyString)
);

export const setTrackingId = nonEmptyStringAction('commerce/setTrackingId');
export const setLanguage = nonEmptyStringAction('commerce/setLanguage');
export const setCurrency = nonEmptyStringAction('commerce/setCurrency');
export const setClientId = nonEmptyStringAction('commerce/setClientId');

type SetUserPayload = UserParams;

export const setUser = createAction(
  'commerce/setUser',
  (payload: SetUserPayload) =>
    validatePayload(payload, {
      userId: nonEmptyString,
      email: nonEmptyString,
      userIp: nonEmptyString,
      userAgent: nonEmptyString,
    })
);

type SetViewPayload = ViewParams;

export const setView = createAction(
  'commerce/setView',
  (payload: SetViewPayload) =>
    validatePayload(payload, {
      url: requiredNonEmptyString,
    })
);
