import {RecordValue, StringValue} from '@coveo/bueno';
import {QuestionAnswerDocumentIdentifier} from '../../controllers';

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
          contentIdKey: new StringValue({required: true, emptyAllowed: false}),
          contentIdValue: new StringValue({
            required: true,
            emptyAllowed: false,
          }),
        },
      }),
    },
    options: {
      required: true,
    },
  });
