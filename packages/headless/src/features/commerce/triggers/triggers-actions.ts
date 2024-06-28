import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {ApplyQueryTriggerModificationPayload} from '../../triggers/triggers-actions';

export type UpdateIgnoreQueryTriggerPayload = {
  /**
   * The query to ignore.
   */
  q: string;
};

export const updateIgnoreQueryTrigger = createAction(
  'commerce/triggers/query/ignore',
  (payload: UpdateIgnoreQueryTriggerPayload) =>
    validatePayload(payload, {
      q: new StringValue({emptyAllowed: true, required: true}),
    })
);

export const applyQueryTriggerModification = createAction(
  'commerce/triggers/query/applyModification',
  (payload: ApplyQueryTriggerModificationPayload) =>
    validatePayload<ApplyQueryTriggerModificationPayload>(
      payload,
      new RecordValue({
        values: {originalQuery: nonEmptyString, modification: nonEmptyString},
      })
    )
);
