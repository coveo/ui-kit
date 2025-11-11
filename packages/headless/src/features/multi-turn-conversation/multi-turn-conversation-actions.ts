import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {
  GeneratedAnswerCitation,
  GeneratedAnswerMessagePayload,
} from '../../api/generated-answer/generated-answer-event-payload.js';
import {validatePayload} from '../../utils/validate-payload.js';
import type {GeneratedContentFormat} from '../generated-answer/generated-response-format.js';

const stringValue = new StringValue({required: true});

export const resetConversation = createAction<{conversationId: string}>(
  'multiTurn/resetConversation'
);

export const addAnswer = createAction<{prompt: string}>('multiTurn/addAnswer');

export const updateActiveAnswerMessage = createAction(
  'multiTurn/updateActiveAnswerMessage',
  (payload: GeneratedAnswerMessagePayload) =>
    validatePayload(payload, {
      textDelta: stringValue,
    })
);

export const updateActiveAnswer = createAction<
  Partial<{
    answer: string;
    prompt: string;
    citations: GeneratedAnswerCitation[];
    isStreaming: boolean;
    isLoading: boolean;
    error: string | null;
    cannotAnswer: boolean;
    answerId: string;
    answerContentFormat: GeneratedContentFormat;
  }>
>('multiTurn/updateActiveAnswer');

export const updateCitationsToActiveAnswer = createAction<
  GeneratedAnswerCitation[]
>('multiTurn/updateCitationsToActiveAnswer');

export const markActiveAnswerComplete = createAction(
  'multiTurn/markActiveAnswerComplete'
);
