import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';

export const undoQueryTrigger = createAction(
  'trigger/query/undo',
  (q: string) => validatePayload(q, requiredNonEmptyString)
);
