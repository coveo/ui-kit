import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../utils/validate-payload.js';

export interface ApplyQueryTriggerModificationPayload {
  originalQuery: string;
  newQuery: string;
}

export const updateIgnoreQueryTrigger = createAction(
  'trigger/query/ignore',
  (q: string) =>
    validatePayload(q, new StringValue({emptyAllowed: true, required: true}))
);

export const applyQueryTriggerModification = createAction(
  'trigger/query/modification',
  (payload: ApplyQueryTriggerModificationPayload) =>
    validatePayload<ApplyQueryTriggerModificationPayload>(
      payload,
      new RecordValue({
        values: {originalQuery: nonEmptyString, modification: nonEmptyString},
      })
    )
);
