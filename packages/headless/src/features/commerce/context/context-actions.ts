import { createAction } from '@reduxjs/toolkit';
import {nonEmptyString, requiredNonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {UserParams, ViewParams} from '../../../api/commerce/commerce-api-params';
import { RecordValue } from '@coveo/bueno';

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
  (payload: SetContextPayload) =>
    validatePayload(payload, {
      trackingId: requiredNonEmptyString,
      language: requiredNonEmptyString,
      currency: requiredNonEmptyString,
      clientId: requiredNonEmptyString,
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

const requiredNonEmptyStringAction = (type: string) => createAction(
  type,
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setTrackingId = requiredNonEmptyStringAction('commerce/setTrackingId');
export const setLanguage = requiredNonEmptyStringAction('commerce/setLanguage');
export const setCurrency = requiredNonEmptyStringAction('commerce/setCurrency');
export const setClientId = requiredNonEmptyStringAction('commerce/setClientId');

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
