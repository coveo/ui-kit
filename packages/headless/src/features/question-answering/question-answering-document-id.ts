import {z} from '@coveo/bueno/zod';
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
  z.object({
    questionAnswerId: requiredNonEmptyString,
  });

export const inlineLinkPayloadDefinition = () =>
  z.object({
    linkText: requiredEmptyAllowedString,
    linkURL: requiredEmptyAllowedString,
  });

export function validateQuestionAnsweringActionCreatorPayload(
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
) {
  return validatePayload<QuestionAnsweringUniqueIdentifierActionCreatorPayload>(
    payload,
    uniqueIdentifierPayloadDefinition()
  );
}
