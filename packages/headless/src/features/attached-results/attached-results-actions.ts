import {
  ArrayValue,
  BooleanValue,
  isNullOrUndefined,
  RecordValue,
  SchemaValidationError,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  nonEmptyString,
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
} from '../../utils/validate-payload.js';
import type {AttachedResult} from './attached-results-state.js';

export interface SetAttachedResultsActionCreatorPayload {
  /**
   * The array of all attached results.
   */
  results: AttachedResult[];

  /**
   * Is the data for Attached Results currently loading.
   */
  loading?: boolean;
}

const attachedResultPayloadDefinition = {
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
};

const RequiredAttachedResultRecord = new RecordValue({
  options: {
    required: true,
  },
  values: attachedResultPayloadDefinition,
});

export const setAttachedResults = createAction(
  'insight/attachToCase/setAttachedResults',
  (payload: SetAttachedResultsActionCreatorPayload) =>
    validatePayload(payload, {
      results: new ArrayValue({
        each: RequiredAttachedResultRecord,
      }),
      loading: new BooleanValue({
        required: false,
        default: false,
      }),
    })
);

export const attachResult = createAction(
  'insight/attachToCase/attach',
  (payload: AttachedResult) => validatePayloadAndPermanentIdOrUriHash(payload)
);

export const detachResult = createAction(
  'insight/attachToCase/detach',
  (payload: AttachedResult) => validatePayloadAndPermanentIdOrUriHash(payload)
);

const validatePayloadAndPermanentIdOrUriHash = (payload: AttachedResult) => {
  if (
    isNullOrUndefined(payload.permanentId) &&
    isNullOrUndefined(payload.uriHash)
  ) {
    return {
      payload,
      error: serializeSchemaValidationError(
        new SchemaValidationError(
          'Either permanentId or uriHash is required'
        ) as Error
      ),
    };
  }
  return validatePayload(payload, attachedResultPayloadDefinition);
};
