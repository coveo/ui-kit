import {createReducer} from '@reduxjs/toolkit';
import {filterOutDuplicatedCitations} from '../generated-answer/utils/generated-answer-citation-utils.js';
import {
  activeFollowUpStartFailed,
  clearFollowUpAnswersConversationToken,
  createFollowUpAnswer,
  dislikeFollowUp,
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  followUpStepFinished,
  followUpStepStarted,
  followUpToolCallArgs,
  followUpToolCallFinished,
  followUpToolCallStarted,
  likeFollowUp,
  resetFollowUpAnswers,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpAnswersConversationId,
  setFollowUpAnswersConversationToken,
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

function getActiveFollowUp(state: FollowUpAnswersState): FollowUpAnswer | undefined {
  return state.followUpAnswers.find((a) => a.isActive);
}

function getFollowUpByAnswerId(
  state: FollowUpAnswersState,
  answerId: string
): FollowUpAnswer | undefined {
  return state.followUpAnswers.find((a) => a.answerId === answerId);
}

export const followUpAnswersReducer = createReducer(getFollowUpAnswersInitialState(), (builder) =>
  builder
    .addCase(setIsEnabled, (state, {payload}) => {
      state.isEnabled = payload;
    })
    .addCase(setFollowUpAnswersConversationId, (state, {payload}) => {
      state.conversationId = payload;
    })
    .addCase(setFollowUpAnswersConversationToken, (state, {payload}) => {
      state.conversationToken = payload;
    })
    .addCase(clearFollowUpAnswersConversationToken, (state) => {
      state.conversationToken = '';
    })
    .addCase(createFollowUpAnswer, (state, {payload}) => {
      const active = getActiveFollowUp(state);
      if (active) {
        active.isActive = false;
      }
      state.followUpAnswers.push(createInitialFollowUpAnswer(payload.question));
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
      state.conversationToken = '';
      state.isEnabled = false;
    })
    .addCase(followUpToolCallStarted, (state, {payload}) => {
      const {toolCallName, toolCallId, startedAt, answerId} = payload;
      const followUpAnswer = getFollowUpByAnswerId(state, answerId);
      if (!followUpAnswer) {
        return;
      }

      const currentActiveStep = followUpAnswer.generationSteps.findLast(
        (step) => step.status === 'active'
      );
      if (currentActiveStep) {
        currentActiveStep.toolCalls = currentActiveStep.toolCalls || [];
        currentActiveStep.toolCalls.push({
          toolCallName,
          toolCallId,
          startedAt,
          status: 'active',
        });
      }
    })
    .addCase(followUpToolCallArgs, (state, {payload}) => {
      const {toolCallId, args, answerId, type} = payload;
      const followUpAnswer = getFollowUpByAnswerId(state, answerId);
      if (!followUpAnswer) {
        return;
      }

      const currentActiveStep = followUpAnswer.generationSteps.findLast(
        (step) => step.status === 'active'
      );
      const toolCall = currentActiveStep?.toolCalls?.find((call) => call.toolCallId === toolCallId);
      if (toolCall) {
        toolCall.toolCallArgs = args;
        toolCall.type = type === 'search' ? 'search' : 'generic';
      }
    })
    .addCase(followUpToolCallFinished, (state, {payload}) => {
      const {toolCallId, finishedAt, answerId} = payload;
      const followUpAnswer = getFollowUpByAnswerId(state, answerId);
      if (!followUpAnswer) {
        return;
      }

      const currentActiveStep = followUpAnswer.generationSteps.findLast(
        (step) => step.status === 'active'
      );
      const toolCall = currentActiveStep?.toolCalls?.find((call) => call.toolCallId === toolCallId);
      if (toolCall) {
        toolCall.finishedAt = finishedAt;
        toolCall.status = 'completed';
      }
    })
);
