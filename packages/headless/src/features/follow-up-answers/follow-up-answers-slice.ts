import {createReducer} from '@reduxjs/toolkit';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client.js';
import {filterOutDuplicatedCitations} from '../generated-answer/utils/generated-answer-citation-utils.js';
import {
  addFollowUpAnswer,
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpIsAnswerGenerated,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  setIsEnabled,
  updateActiveFollowUpAnswerCitations,
  updateActiveFollowUpAnswerMessage,
  updateActiveFollowUpError,
} from './follow-up-answers-actions.js';
import {
  createInitialFollowUpAnswer,
  type FollowUpAnswer,
  type FollowUpAnswersState,
  getFollowUpAnswersInitialState,
} from './follow-up-answers-state.js';

function getActiveFollowUp(
  state: FollowUpAnswersState
): FollowUpAnswer | undefined {
  return state.answers[state.answers.length - 1];
}

export const followUpAnswersReducer = createReducer(
  getFollowUpAnswersInitialState(),
  (builder) =>
    builder
      .addCase(setIsEnabled, (state, {payload}) => {
        state.isEnabled = payload;
      })
      .addCase(addFollowUpAnswer, (state, {payload}) => {
        state.answers.push(createInitialFollowUpAnswer(payload));
      })
      .addCase(updateActiveFollowUpAnswerMessage, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.isLoading = false;
        followUpAnswer.isStreaming = true;
        if (!followUpAnswer.answer) {
          followUpAnswer.answer = '';
        }

        followUpAnswer.answer += payload.textDelta;
        delete followUpAnswer.error;
      })
      .addCase(updateActiveFollowUpAnswerCitations, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.isLoading = false;
        followUpAnswer.isStreaming = true;
        followUpAnswer.citations = filterOutDuplicatedCitations([
          ...followUpAnswer.citations,
          ...payload.citations,
        ]);
        delete followUpAnswer.error;
      })
      .addCase(updateActiveFollowUpError, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.isLoading = false;
        followUpAnswer.isStreaming = false;
        followUpAnswer.error = {
          ...payload,
          isRetryable: payload.code === RETRYABLE_STREAM_ERROR_CODE,
        };
        followUpAnswer.citations = [];
        delete followUpAnswer.answer;
      })
      .addCase(setActiveFollowUpIsLoading, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.isLoading = payload;
      })
      .addCase(setActiveFollowUpIsStreaming, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.isStreaming = payload;
      })
      .addCase(setActiveFollowUpAnswerContentFormat, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.answerContentFormat = payload;
      })
      .addCase(setActiveFollowUpAnswerId, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.answerId = payload;
      })
      .addCase(setActiveFollowUpIsAnswerGenerated, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.isAnswerGenerated = payload;
      })
      .addCase(setActiveFollowUpCannotAnswer, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.cannotAnswer = payload;
      })
);
