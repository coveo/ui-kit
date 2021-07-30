import {RecordValue} from '@coveo/bueno';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {requiredNonEmptyString} from '../../utils/validate-payload';

/**
 * Identifies the document from which the answer originate.
 */
export interface QuestionAnsweringDocumentIdActionCreatorPayload
  extends QuestionAnswerDocumentIdentifier {}

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
