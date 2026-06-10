import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  nonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import type {ApplyQueryTriggerModificationPayload} from '../../triggers/triggers-actions.js';

export type UpdateIgnoreQueryTriggerPayload = {
  /**
   * The query to ignore.
   */
  q: string;
};

export const updateIgnoreQueryTrigger = createAction(
  'commerce/triggers/query/updateIgnore',
  (payload: UpdateIgnoreQueryTriggerPayload) =>
    validatePayload(
      payload,
      z.object({
        q: z.string(),
      })
    )
);

export const applyQueryTriggerModification = createAction(
  'commerce/triggers/query/applyModification',
  (payload: ApplyQueryTriggerModificationPayload) =>
    validatePayload<ApplyQueryTriggerModificationPayload>(
      payload,
      z.object({originalQuery: nonEmptyString, modification: nonEmptyString})
    )
);
