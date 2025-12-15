import {
  BooleanValue,
  isNullOrUndefined,
  isString,
  SchemaValidationError,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';
import {
  nonEmptyString,
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
} from '../../../utils/validate-payload.js';
import type {AttachedResult} from '../attached-results-state.js';

/**
 * Helper function to safely convert field values to strings
 */
const ensureStringOrUndefined = (value: unknown): string | undefined =>
  isString(value) ? String(value) : undefined;

export interface AttachCitationActionCreatorPayload {
  /**
   * The citation to attach.
   */
  citation: GeneratedAnswerCitation;
  /**
   * The case ID to attach the citation to.
   */
  caseId: string;
}

/**
 * Maps a GeneratedAnswerCitation to an AttachedResult
 */
export function mapCitationToAttachedResult(
  citation: GeneratedAnswerCitation,
  caseId: string
): AttachedResult {
  return {
    caseId,
    permanentId: citation.permanentid,
    resultUrl: citation.clickUri ?? citation.uri,
    title: citation.title,
    uriHash: ensureStringOrUndefined(citation.fields?.urihash),
    source: citation.source ?? ensureStringOrUndefined(citation.fields?.source),
    // Fields needed to support case articles
    knowledgeArticleId: ensureStringOrUndefined(
      citation.fields?.knowledgeArticleId ?? citation.fields?.sfkbid
    ),
    articleLanguage: ensureStringOrUndefined(citation.fields?.sflanguage),
    articleVersionNumber: ensureStringOrUndefined(
      citation.fields?.sfversionnumber
    ),
    articlePublishStatus: ensureStringOrUndefined(
      citation.fields?.sfpublishstatus
    ),
    // Field to indicate that this attached result is a citation
    isCitation: true,
  };
}

const attachedCitationPayloadDefinition = {
  caseId: requiredNonEmptyString,
  permanentId: nonEmptyString,
  resultUrl: nonEmptyString,
  title: requiredNonEmptyString,
  uriHash: nonEmptyString || undefined,
  source: nonEmptyString,
  knowledgeArticleId: nonEmptyString || undefined,
  articleLanguage: nonEmptyString || undefined,
  articleVersionNumber: nonEmptyString || undefined,
  articlePublishStatus: nonEmptyString || undefined,
  isCitation: new BooleanValue({required: true}),
};

export const attachCitation = createAction(
  'insight/attachToCase/attachCitation',
  (payload: AttachCitationActionCreatorPayload) => {
    const mappedResult = mapCitationToAttachedResult(
      payload.citation,
      payload.caseId
    );
    return validatePayloadAndPermanentIdOrUriHash(mappedResult);
  }
);

export const detachCitation = createAction(
  'insight/attachToCase/detachCitation',
  (payload: AttachedResult) => {
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
    return validatePayloadAndPermanentIdOrUriHash(payload);
  }
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
  return validatePayload(payload, attachedCitationPayloadDefinition);
};
