import {z} from '@coveo/bueno/zod';
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
import {
  GENERATION_STEP_NAMES,
  type GenerationStepName,
  normalizeGenerationStepName,
} from '../generated-answer/generated-answer-state.js';
import type {GeneratedContentFormat} from '../generated-answer/generated-response-format.js';

const stringValue = z.string();
const generationStepNameValue = z.enum(GENERATION_STEP_NAMES);

const normalizeGenerationStepPayload = <T extends {name: string}>(
  payload: T
): Omit<T, 'name'> & {name: GenerationStepName} => ({
  ...payload,
  name: normalizeGenerationStepName(payload.name),
});

export const setIsEnabled = createAction(
  'followUpAnswers/setIsEnabled',
  (payload: boolean) => validatePayload(payload, z.boolean())
);

export const setFollowUpAnswersConversationId = createAction(
  'followUpAnswers/setFollowUpAnswersConversationId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setFollowUpAnswersConversationToken = createAction(
  'followUpAnswers/setFollowUpAnswersConversationToken',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const clearFollowUpAnswersConversationToken = createAction(
  'followUpAnswers/clearFollowUpAnswersConversationToken'
);

export const createFollowUpAnswer = createAction(
  'followUpAnswers/createFollowUpAnswer',
  (payload: {question: string}) =>
    validatePayload(
      payload,
      z.object({
        question: requiredNonEmptyString,
      })
    )
);

export const setActiveFollowUpAnswerId = createAction(
  'followUpAnswers/setActiveFollowUpAnswerId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setFollowUpAnswerContentFormat = createAction(
  'followUpAnswers/setFollowUpAnswerContentFormat',
  (payload: {answerId: string; contentFormat: GeneratedContentFormat}) =>
    validatePayload(
      payload,
      z.object({
        contentFormat: answerContentFormatSchema,
        answerId: requiredNonEmptyString,
      })
    )
);

export const setFollowUpIsLoading = createAction(
  'followUpAnswers/setFollowUpIsLoading',
  (payload: {answerId: string; isLoading: boolean}) =>
    validatePayload(
      payload,
      z.object({
        isLoading: z.boolean(),
        answerId: requiredNonEmptyString,
      })
    )
);

export const setFollowUpIsStreaming = createAction(
  'followUpAnswers/setFollowUpIsStreaming',
  (payload: {answerId: string; isStreaming: boolean}) =>
    validatePayload(
      payload,
      z.object({
        isStreaming: z.boolean(),
        answerId: requiredNonEmptyString,
      })
    )
);

export const followUpMessageChunkReceived = createAction(
  'followUpAnswers/followUpMessageChunkReceived',
  (payload: {answerId: string; textDelta: string}) =>
    validatePayload(
      payload,
      z.object({
        textDelta: stringValue,
        answerId: requiredNonEmptyString,
      })
    )
);

export const followUpCitationsReceived = createAction(
  'followUpAnswers/followUpCitationsReceived',
  (payload: {answerId: string; citations: GeneratedAnswerCitation[]}) =>
    validatePayload(
      payload,
      z.object({
        citations: z.array(citationSchema),
        answerId: requiredNonEmptyString,
      })
    )
);

export const followUpCompleted = createAction(
  'followUpAnswers/followUpCompleted',
  (payload: {answerId: string; cannotAnswer?: boolean}) =>
    validatePayload(
      payload,
      z.object({
        answerId: requiredNonEmptyString,
        cannotAnswer: z.optional(z.boolean()),
      })
    )
);

export const followUpFailed = createAction(
  'followUpAnswers/followUpFailed',
  (payload: {answerId: string; message?: string; code?: number}) =>
    validatePayload(
      payload,
      z.object({
        message: z.optional(z.string()),
        code: z.optional(z.number().check(z.minimum(0))),
        answerId: requiredNonEmptyString,
      })
    )
);

export const activeFollowUpStartFailed = createAction(
  'followUpAnswers/activeFollowUpStartFailed',
  (payload: {message?: string}) =>
    validatePayload(
      payload,
      z.object({
        message: z.optional(z.string()),
      })
    )
);

export const likeFollowUp = createAction(
  'followUpAnswers/likeFollowUp',
  (payload: {answerId: string}) =>
    validatePayload(
      payload,
      z.object({
        answerId: requiredNonEmptyString,
      })
    )
);

export const dislikeFollowUp = createAction(
  'followUpAnswers/dislikeFollowUp',
  (payload: {answerId: string}) =>
    validatePayload(
      payload,
      z.object({
        answerId: requiredNonEmptyString,
      })
    )
);

export const submitFollowUpFeedback = createAction(
  'followUpAnswers/submitFollowUpFeedback',
  (payload: {answerId: string}) =>
    validatePayload(
      payload,
      z.object({
        answerId: requiredNonEmptyString,
      })
    )
);

export const resetFollowUpAnswers = createAction(
  'followUpAnswers/resetFollowUpAnswers'
);

export const followUpStepStarted = createAction(
  'followUpAnswers/stepStarted',
  (payload: {answerId: string; name: string; startedAt: number}) =>
    validatePayload(
      normalizeGenerationStepPayload(payload),
      z.object({
        answerId: requiredNonEmptyString,
        name: generationStepNameValue,
        startedAt: z.number().check(z.minimum(0)),
      })
    )
);

export const followUpStepFinished = createAction(
  'followUpAnswers/stepFinished',
  (payload: {answerId: string; name: string; finishedAt: number}) =>
    validatePayload(
      normalizeGenerationStepPayload(payload),
      z.object({
        answerId: requiredNonEmptyString,
        name: generationStepNameValue,
        finishedAt: z.number().check(z.minimum(0)),
      })
    )
);
