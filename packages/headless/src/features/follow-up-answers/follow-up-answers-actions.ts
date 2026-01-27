import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
} from '../../api/generated-answer/generated-answer-event-payload.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  answerContentFormatSchema,
  citationSchema,
  type GeneratedAnswerErrorPayload,
} from '../generated-answer/generated-answer-actions.js';
import type {GeneratedContentFormat} from '../generated-answer/generated-response-format.js';

const stringValue = new StringValue({required: true});

export const setIsEnabled = createAction(
  'followUpAnswers/setIsEnabled',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const addFollowUpAnswer = createAction<string>(
  'followUpAnswers/addFollowUpAnswer'
);

export const updateActiveFollowUpAnswerMessage = createAction(
  'followUpAnswers/updateActiveFollowUpMessage',
  (payload: GeneratedAnswerMessagePayload) =>
    validatePayload(payload, {
      textDelta: stringValue,
    })
);

export const setActiveFollowUpAnswerCitations = createAction(
  'followUpAnswers/setActiveFollowUpCitations',
  (payload: GeneratedAnswerCitationsPayload) =>
    validatePayload(payload, {
      citations: new ArrayValue({
        required: true,
        each: new RecordValue({
          values: citationSchema,
        }),
      }),
    })
);

export const setActiveFollowUpError = createAction(
  'followUpAnswers/setActiveFollowUpError',
  (payload: GeneratedAnswerErrorPayload) =>
    validatePayload(payload, {
      message: new StringValue(),
      code: new NumberValue({min: 0}),
    })
);

export const setActiveFollowUpIsLoading = createAction(
  'followUpAnswers/setActiveFollowUpIsLoading',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const setActiveFollowUpIsStreaming = createAction(
  'followUpAnswers/setActiveFollowUpIsStreaming',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const setActiveFollowUpAnswerContentFormat = createAction(
  'followUpAnswers/setActiveFollowUpAnswerContentFormat',
  (payload: GeneratedContentFormat) =>
    validatePayload(payload, answerContentFormatSchema)
);

export const setActiveFollowUpAnswerId = createAction(
  'followUpAnswers/setActiveFollowUpAnswerId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setActiveFollowUpCannotAnswer = createAction(
  'followUpAnswers/setActiveFollowUpCannotAnswer',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const resetFollowUpAnswers = createAction(
  'followUpAnswers/resetFollowUpAnswers'
);

export const setFollowUpAnswersSessionId = createAction(
  'followUpAnswers/setFollowUpAnswersSessionId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
