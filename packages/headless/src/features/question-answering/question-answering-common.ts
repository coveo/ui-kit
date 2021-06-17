import {RecordValue, StringValue} from '@coveo/bueno';
import {QuestionAnswerDocumentIdentifier} from '../../controllers';

export interface QuestionAnsweringDocumentIdentifierActionCreatorPayload
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
