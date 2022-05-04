import {RecordValue} from '@coveo/bueno';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';

/**
 * Identifies the document from which the answer originate.
 *
 * @deprecated - Some related questions share the same source. Dispatching actions using their id is recommended instead.
 */
export interface QuestionAnsweringDocumentIdActionCreatorPayload
  extends QuestionAnswerDocumentIdentifier {}

export interface QuestionAnsweringUniqueIdentifierActionCreatorPayload {
  questionAnswerId: string;
}

export const documentIdentifierPayloadDefinition = () =>
  new RecordValue({
    values: {
      documentId: new RecordValue({
        values: {
          contentIdKey: requiredNonEmptyString,
          contentIdValue: requiredNonEmptyString,
        },
      }),
    },
    options: {
      required: true,
    },
  });

export const uniqueIdentifierPayloadDefinition = () =>
  new RecordValue({
    values: {
      questionAnswerId: requiredNonEmptyString,
    },
    options: {required: true},
  });

export function isQuestionAnsweringUniqueIdentifierActionCreatorPayload(
  payload:
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
): payload is QuestionAnsweringUniqueIdentifierActionCreatorPayload {
  return !('contentIdKey' in payload || 'contentIdValue' in payload);
}

export function validateQuestionAnsweringActionCreatorPayload(
  payload:
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
) {
  if (isQuestionAnsweringUniqueIdentifierActionCreatorPayload(payload)) {
    return validatePayload(payload, uniqueIdentifierPayloadDefinition());
  }
  return validatePayload(payload, documentIdentifierPayloadDefinition());
}
