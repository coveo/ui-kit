import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {ApplyQueryTriggerModificationPayload} from '../../triggers/triggers-actions';

export const updateIgnoreQueryTrigger = createAction(
  'commerce/trigger/query/ignore',
  (q: string) =>
    validatePayload(q, new StringValue({emptyAllowed: true, required: true}))
);

export const applyQueryTriggerModification = createAction(
  'commerce/trigger/query/modification',
  (payload: ApplyQueryTriggerModificationPayload) =>
    validatePayload<ApplyQueryTriggerModificationPayload>(
      payload,
      new RecordValue({
        values: {originalQuery: nonEmptyString, modification: nonEmptyString},
      })
    )
);
