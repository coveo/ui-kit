import {z} from '@coveo/bueno/zod';
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

const attachedResultPayloadDefinition = z.object({
  articleLanguage: nonEmptyString,
  articlePublishStatus: nonEmptyString,
  articleVersionNumber: nonEmptyString,
  caseId: requiredNonEmptyString,
  knowledgeArticleId: nonEmptyString,
  permanentId: nonEmptyString,
  resultUrl: requiredNonEmptyString,
  source: nonEmptyString,
  title: requiredNonEmptyString,
  uriHash: nonEmptyString,
  isAttachedFromCitation: z.optional(z.boolean()),
});

//TODO: SFINT-6621 - Change type from insight/attachToCase... to insight/attachedResults...
export const setAttachedResults = createAction(
  'insight/attachToCase/setAttachedResults',
  (payload: SetAttachedResultsActionCreatorPayload) =>
    validatePayload(
      payload,
      z.object({
        results: z.array(attachedResultPayloadDefinition),
        loading: z.optional(z.boolean()),
      })
    )
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
  if (payload.permanentId == null && payload.uriHash == null) {
    return {
      payload,
      error: serializeSchemaValidationError(
        new Error('Either permanentId or uriHash is required')
      ),
    };
  }
  return validatePayload(payload, attachedResultPayloadDefinition);
};
