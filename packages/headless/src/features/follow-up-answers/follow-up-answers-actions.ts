import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  answerContentFormatSchema,
  citationSchema,
} from '../generated-answer/generated-answer-actions.js';
import type {GeneratedContentFormat} from '../generated-answer/generated-response-format.js';

const stringValue = new StringValue({required: true});

export const setIsEnabled = createAction(
  'followUpAnswers/setIsEnabled',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const setFollowUpAnswersConversationId = createAction(
  'followUpAnswers/setFollowUpAnswersConversationId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const createFollowUpAnswer = createAction(
  'followUpAnswers/createFollowUpAnswer',
  (payload: {question: string}) =>
    validatePayload(payload, {
      question: requiredNonEmptyString,
    })
);

export const setActiveFollowUpAnswerId = createAction(
  'followUpAnswers/setActiveFollowUpAnswerId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setFollowUpAnswerContentFormat = createAction(
  'followUpAnswers/setFollowUpAnswerContentFormat',
  (payload: {answerId: string; contentFormat: GeneratedContentFormat}) =>
    validatePayload(payload, {
      contentFormat: answerContentFormatSchema,
      answerId: requiredNonEmptyString,
    })
);

export const setFollowUpIsLoading = createAction(
  'followUpAnswers/setFollowUpIsLoading',
  (payload: {answerId: string; isLoading: boolean}) =>
    validatePayload(payload, {
      isLoading: new BooleanValue({required: true}),
      answerId: requiredNonEmptyString,
    })
);

export const followUpMessageChunkReceived = createAction(
  'followUpAnswers/followUpMessageChunkReceived',
  (payload: {answerId: string; textDelta: string}) =>
    validatePayload(payload, {
      textDelta: stringValue,
      answerId: requiredNonEmptyString,
    })
);

export const followUpCitationsReceived = createAction(
  'followUpAnswers/followUpCitationsReceived',
  (payload: {answerId: string; citations: GeneratedAnswerCitation[]}) =>
    validatePayload(payload, {
      citations: new ArrayValue({
        required: true,
        each: new RecordValue({
          values: citationSchema,
        }),
      }),
      answerId: requiredNonEmptyString,
    })
);

export const followUpCompleted = createAction(
  'followUpAnswers/followUpCompleted',
  (payload: {answerId: string; cannotAnswer?: boolean}) =>
    validatePayload(payload, {
      answerId: requiredNonEmptyString,
      cannotAnswer: new BooleanValue({required: false}),
    })
);

export const followUpFailed = createAction(
  'followUpAnswers/followUpFailed',
  (payload: {answerId: string; message?: string; code?: number}) =>
    validatePayload(payload, {
      message: new StringValue(),
      code: new NumberValue({min: 0}),
      answerId: requiredNonEmptyString,
    })
);

export const likeFollowUp = createAction(
  'followUpAnswers/likeFollowUp',
  (payload: {answerId: string}) =>
    validatePayload(payload, {
      answerId: requiredNonEmptyString,
    })
);

export const dislikeFollowUp = createAction(
  'followUpAnswers/dislikeFollowUp',
  (payload: {answerId: string}) =>
    validatePayload(payload, {
      answerId: requiredNonEmptyString,
    })
);

export const submitFollowUpFeedback = createAction(
  'followUpAnswers/submitFollowUpFeedback',
  (payload: {answerId: string}) =>
    validatePayload(payload, {
      answerId: requiredNonEmptyString,
    })
);

export const resetFollowUpAnswers = createAction(
  'followUpAnswers/resetFollowUpAnswers'
);
