import { createAction } from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {UserParams} from '../../../api/commerce/commerce-api-params';
import { RecordValue } from '@coveo/bueno';

export interface SetContextPayload {
  trackingId?: string;
  language?: string;
  currency?: string;
  clientId?: string;
  user?: UserParams;
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
    })
);
