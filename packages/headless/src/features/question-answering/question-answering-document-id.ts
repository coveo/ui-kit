import {RecordValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';

export interface QuestionAnsweringUniqueIdentifierActionCreatorPayload {
  questionAnswerId: string;
}

export interface QuestionAnsweringInlineLinkActionCreatorPayload {
  linkText: string;
  linkURL: string;
}

export const uniqueIdentifierPayloadDefinition = () =>
  new RecordValue({
    values: {
      questionAnswerId: requiredNonEmptyString,
    },
    options: {required: true},
  });

export const inlineLinkPayloadDefinition = () =>
  new RecordValue({
    values: {
      linkText: requiredEmptyAllowedString,
      linkURL: requiredEmptyAllowedString,
    },
    options: {required: true},
  });

export function validateQuestionAnsweringActionCreatorPayload(
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
) {
  return validatePayload<QuestionAnsweringUniqueIdentifierActionCreatorPayload>(
    payload,
    uniqueIdentifierPayloadDefinition()
  );
}
