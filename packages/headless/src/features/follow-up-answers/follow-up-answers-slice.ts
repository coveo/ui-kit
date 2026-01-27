import {createReducer} from '@reduxjs/toolkit';
import {filterOutDuplicatedCitations} from '../generated-answer/utils/generated-answer-citation-utils.js';
import {
  addFollowUpAnswer,
  setActiveFollowUpAnswerCitations,
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpError,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  setIsEnabled,
  updateActiveFollowUpAnswerMessage,
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
  return state.followUpAnswers[state.followUpAnswers.length - 1];
}

export const followUpAnswersReducer = createReducer(
  getFollowUpAnswersInitialState(),
  (builder) =>
    builder
      .addCase(setIsEnabled, (state, {payload}) => {
        state.isEnabled = payload;
      })
      .addCase(addFollowUpAnswer, (state, {payload}) => {
        state.followUpAnswers.push(createInitialFollowUpAnswer(payload));
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
      .addCase(setActiveFollowUpAnswerCitations, (state, {payload}) => {
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
      .addCase(setActiveFollowUpError, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.isLoading = false;
        followUpAnswer.isStreaming = false;
        followUpAnswer.error = payload;
        followUpAnswer.citations = [];
        delete followUpAnswer.answer;
      })
      .addCase(setActiveFollowUpCannotAnswer, (state, {payload}) => {
        const followUpAnswer = getActiveFollowUp(state);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.cannotAnswer = payload;
      })
);
