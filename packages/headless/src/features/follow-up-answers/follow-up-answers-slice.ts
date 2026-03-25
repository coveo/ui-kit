import {createReducer} from '@reduxjs/toolkit';
import {filterOutDuplicatedCitations} from '../generated-answer/utils/generated-answer-citation-utils.js';
import {
  activeFollowUpStartFailed,
  createFollowUpAnswer,
  dislikeFollowUp,
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  followUpStepFinished,
  followUpStepStarted,
  likeFollowUp,
  resetFollowUpAnswers,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpAnswersConversationId,
  setFollowUpIsLoading,
  setFollowUpIsStreaming,
  setIsEnabled,
  submitFollowUpFeedback,
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
  return state.followUpAnswers.find((a) => a.isActive);
}

function getFollowUpByAnswerId(
  state: FollowUpAnswersState,
  answerId: string
): FollowUpAnswer | undefined {
  return state.followUpAnswers.find((a) => a.answerId === answerId);
}

export const followUpAnswersReducer = createReducer(
  getFollowUpAnswersInitialState(),
  (builder) =>
    builder
      .addCase(setIsEnabled, (state, {payload}) => {
        state.isEnabled = payload;
      })
      .addCase(setFollowUpAnswersConversationId, (state, {payload}) => {
        state.conversationId = payload;
      })
      .addCase(createFollowUpAnswer, (state, {payload}) => {
        const active = getActiveFollowUp(state);
        if (active) {
          active.isActive = false;
        }
        state.followUpAnswers.push(
          createInitialFollowUpAnswer(payload.question)
        );
      })
      .addCase(setActiveFollowUpAnswerId, (state, {payload}) => {
        const activeFollowUp = getActiveFollowUp(state);
        if (!activeFollowUp || activeFollowUp.answerId) {
          return;
        }
        activeFollowUp.answerId = payload;
      })
      .addCase(setFollowUpAnswerContentFormat, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.answerContentFormat = payload.contentFormat;
      })
      .addCase(setFollowUpIsLoading, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.isLoading = payload.isLoading;
      })
      .addCase(setFollowUpIsStreaming, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }
        followUpAnswer.isStreaming = payload.isStreaming;
      })
      .addCase(followUpMessageChunkReceived, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        if (!followUpAnswer.answer) {
          followUpAnswer.answer = '';
        }
        followUpAnswer.answer += payload.textDelta;
        delete followUpAnswer.error;
      })

      .addCase(followUpCitationsReceived, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.citations = filterOutDuplicatedCitations([
          ...followUpAnswer.citations,
          ...payload.citations,
        ]);
        delete followUpAnswer.error;
      })
      .addCase(followUpCompleted, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.isLoading = false;
        followUpAnswer.isStreaming = false;
        followUpAnswer.isActive = false;
        followUpAnswer.cannotAnswer = !!payload.cannotAnswer;
      })
      .addCase(followUpFailed, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.isLoading = false;
        followUpAnswer.isStreaming = false;
        followUpAnswer.error = {message: payload.message, code: payload.code};
        followUpAnswer.citations = [];
        delete followUpAnswer.answer;
      })
      .addCase(activeFollowUpStartFailed, (state, {payload}) => {
        const activeFollowUp = getActiveFollowUp(state);
        if (!activeFollowUp) {
          return;
        }

        activeFollowUp.isLoading = false;
        activeFollowUp.isStreaming = false;
        activeFollowUp.error = {
          message: payload.message,
        };
        activeFollowUp.citations = [];
        delete activeFollowUp.answer;
      })
      .addCase(likeFollowUp, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.liked = true;
        followUpAnswer.disliked = false;
      })
      .addCase(dislikeFollowUp, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.liked = false;
        followUpAnswer.disliked = true;
      })
      .addCase(submitFollowUpFeedback, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.feedbackSubmitted = true;
      })
      .addCase(followUpStepStarted, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        followUpAnswer.generationSteps = [
          ...followUpAnswer.generationSteps,
          {
            name: payload.name,
            status: 'active',
            startedAt: payload.startedAt,
          },
        ];
      })
      .addCase(followUpStepFinished, (state, {payload}) => {
        const followUpAnswer = getFollowUpByAnswerId(state, payload.answerId);
        if (!followUpAnswer) {
          return;
        }

        const step = followUpAnswer.generationSteps.findLast(
          (step) => step.name === payload.name && step.status === 'active'
        );
        if (step) {
          step.status = 'completed';
          step.finishedAt = payload.finishedAt;
        }
      })
      .addCase(resetFollowUpAnswers, (state) => {
        state.followUpAnswers = [];
        state.conversationId = '';
        state.isEnabled = false;
      })
);
