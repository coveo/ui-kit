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
  isAttachedFromCitation: new BooleanValue({required: false, default: false}),
};

const RequiredAttachedResultRecord = new RecordValue({
  options: {
    required: true,
  },
  values: attachedResultPayloadDefinition,
});

//TODO: SFINT-6621 - Change type from insight/attachToCase... to insight/attachedResults...
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

//TODO: SFINT-6621 - Change type from insight/attachToCase/ to insight/attachedResults/
export const attachResult = createAction(
  'insight/attachToCase/attach',
  (payload: AttachedResult) => validatePayloadAndPermanentIdOrUriHash(payload)
);

//TODO: SFINT-6621 - Change type from insight/attachToCase/ to insight/attachedResults/
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
