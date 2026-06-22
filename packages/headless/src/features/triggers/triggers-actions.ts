import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../utils/validate-payload.js';

export interface ApplyQueryTriggerModificationPayload {
  originalQuery: string;
  newQuery: string;
}

export const updateIgnoreQueryTrigger = createAction(
  'trigger/query/ignore',
  (q: string) => validatePayload(q, z.string())
);

export const applyQueryTriggerModification = createAction(
  'trigger/query/modification',
  (payload: ApplyQueryTriggerModificationPayload) =>
    validatePayload<ApplyQueryTriggerModificationPayload>(
      payload,
      z.object({
        originalQuery: nonEmptyString,
        modification: nonEmptyString,
      })
    )
);
