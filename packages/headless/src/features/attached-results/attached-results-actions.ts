import {ArrayValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {AttachedResult} from './attached-results-state';

export interface SetAttachedResultsActionCreatorPayload {
  /**
   * The array of all attached results.
   */
  results: AttachedResult[];

  /**
   * A potential error message. null if success
   */
  message: string;
}

export interface SetAttachToCaseAttachActionCreatorPayload {
  result: AttachedResult;
}

export interface SetAttachToCaseDetachActionCreatorPayload {
  result: AttachedResult;
}

const RequiredAttachedResultRecord = new RecordValue({
  options: {
    required: true,
  },
  values: {
    articleLanguage: nonEmptyString,
    articlePublishStatus: nonEmptyString,
    articleVersionNumber: nonEmptyString,
    caseId: requiredNonEmptyString,
    knowledgeArticleId: nonEmptyString,
    name: nonEmptyString,
    permanentId: nonEmptyString,
    resultUrl: nonEmptyString,
    source: nonEmptyString,
    title: requiredNonEmptyString,
    uriHash: nonEmptyString,
  },
});

export const setAttachedResults = createAction(
  'insight/attachToCase/setAttachedResults',
  (payload: SetAttachedResultsActionCreatorPayload) =>
    validatePayload(payload, {
      results: new ArrayValue({
        each: RequiredAttachedResultRecord,
      }),
      message: nonEmptyString,
    })
);

export const attachResult = createAction(
  'insight/attachToCase/attach',
  (payload: SetAttachToCaseAttachActionCreatorPayload) =>
    validatePayload(payload, {
      result: RequiredAttachedResultRecord,
    })
);

export const detachResult = createAction(
  'insight/attachToCase/detach',
  (payload: SetAttachToCaseDetachActionCreatorPayload) =>
    validatePayload(payload, {
      result: RequiredAttachedResultRecord,
    })
);
