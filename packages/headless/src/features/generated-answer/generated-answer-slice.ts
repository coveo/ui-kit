import {createReducer} from '@reduxjs/toolkit';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client.js';
import type {GeneratedAnswerStream} from '../../api/knowledge/generated-answer-stream.js';
import type {AnswerApiQueryParams} from '../../features/generated-answer/generated-answer-request.js';
import {
  closeGeneratedAnswerFeedbackModal,
  collapseGeneratedAnswer,
  dislikeGeneratedAnswer,
  expandGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  registerFieldsToIncludeInCitations,
  resetAnswer,
  sendGeneratedAnswerFeedback,
  setAnswerApiQueryParams,
  setAnswerContentFormat,
  setAnswerGenerationMode,
  setAnswerId,
  setCannotAnswer,
  setId,
  setIsAnswerGenerated,
  setIsEnabled,
  setIsLoading,
  setIsStreaming,
  setIsVisible,
  updateAnswerConfigurationId,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
} from './generated-answer-actions.js';
import {
  addFollowUpAnswer,
  hydrateAnswerFromCache,
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpIsAnswerGenerated,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  updateActiveFollowUpAnswerCitations,
  updateActiveFollowUpAnswerMessage,
  updateActiveFollowUpError,
} from './generated-answer-conversation-actions.js';
import {
  type GeneratedAnswerConversationTurn,
  type GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from './generated-answer-state.js';
import {filterOutDuplicatedCitations} from './utils/generated-answer-citation-utils.js';

const createInitialFollowUpTurn = (
  question: string
): GeneratedAnswerConversationTurn => ({
  question: question,
  isVisible: true,
  isLoading: false,
  isStreaming: false,
  citations: [],
  liked: false,
  disliked: false,
  feedbackSubmitted: false,
  isAnswerGenerated: false,
  cannotAnswer: false,
});

function getActiveFollowUp(
  state: GeneratedAnswerState
): GeneratedAnswerConversationTurn | undefined {
  return state.followUpAnswers[state.followUpAnswers.length - 1];
}

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(setIsVisible, (state, {payload}) => {
        state.isVisible = payload;
      })
      .addCase(setIsEnabled, (state, {payload}) => {
        state.isEnabled = payload;
      })
      .addCase(setId, (state, {payload}) => {
        state.id = payload.id;
      })
      .addCase(updateMessage, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = true;
        if (!state.answer) {
          state.answer = '';
        }

        state.answer += payload.textDelta;
        delete state.error;
      })
      .addCase(updateCitations, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = true;
        state.citations = filterOutDuplicatedCitations([
          ...state.citations,
          ...payload.citations,
        ]);
        delete state.error;
      })
      .addCase(updateError, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = false;
        state.error = {
          ...payload,
          isRetryable: payload.code === RETRYABLE_STREAM_ERROR_CODE,
        };
        state.citations = [];
        delete state.answer;
      })
      .addCase(likeGeneratedAnswer, (state) => {
        state.liked = true;
        state.disliked = false;
      })
      .addCase(dislikeGeneratedAnswer, (state) => {
        state.liked = false;
        state.disliked = true;
      })
      .addCase(openGeneratedAnswerFeedbackModal, (state) => {
        state.feedbackModalOpen = true;
      })
      .addCase(closeGeneratedAnswerFeedbackModal, (state) => {
        state.feedbackModalOpen = false;
      })
      .addCase(sendGeneratedAnswerFeedback, (state) => {
        state.feedbackSubmitted = true;
      })
      .addCase(resetAnswer, (state) => {
        return {
          ...getGeneratedAnswerInitialState(),
          ...(state.answerConfigurationId
            ? {answerConfigurationId: state.answerConfigurationId}
            : {}),
          responseFormat: state.responseFormat,
          fieldsToIncludeInCitations: state.fieldsToIncludeInCitations,
          isVisible: state.isVisible,
          id: state.id,
        };
      })
      .addCase(setIsLoading, (state, {payload}) => {
        state.isLoading = payload;
      })
      .addCase(setIsStreaming, (state, {payload}) => {
        state.isStreaming = payload;
      })
      .addCase(setAnswerContentFormat, (state, {payload}) => {
        state.answerContentFormat = payload;
      })
      .addCase(updateResponseFormat, (state, {payload}) => {
        state.responseFormat = payload;
      })
      .addCase(registerFieldsToIncludeInCitations, (state, action) => {
        state.fieldsToIncludeInCitations = [
          ...new Set(state.fieldsToIncludeInCitations.concat(action.payload)),
        ];
      })
      .addCase(setIsAnswerGenerated, (state, {payload}) => {
        state.isAnswerGenerated = payload;
      })
      .addCase(expandGeneratedAnswer, (state) => {
        state.expanded = true;
      })
      .addCase(collapseGeneratedAnswer, (state) => {
        state.expanded = false;
      })
      .addCase(updateAnswerConfigurationId, (state, {payload}) => {
        state.answerConfigurationId = payload;
      })
      .addCase(setCannotAnswer, (state, {payload}) => {
        state.cannotAnswer = payload;
      })
      .addCase(setAnswerApiQueryParams, (state, {payload}) => {
        state.answerApiQueryParams = payload as AnswerApiQueryParams;
      })
      .addCase(setAnswerId, (state, {payload}) => {
        state.answerId = payload;
      })
      .addCase(setAnswerGenerationMode, (state, {payload}) => {
        state.answerGenerationMode = payload;
      })
      .addCase(hydrateAnswerFromCache, (state, {payload}) => {
        const {answerId, answer, citations, contentFormat, error, generated} =
          payload as GeneratedAnswerStream;
        state.answerId = answerId;
        state.answer = answer || '';
        state.citations = citations || [];
        state.answerContentFormat = contentFormat;
        state.isLoading = false;
        state.isStreaming = false;
        state.isAnswerGenerated = generated || false;
        state.error = {
          ...error,
          isRetryable: error?.code === RETRYABLE_STREAM_ERROR_CODE,
        };
      })
      .addCase(addFollowUpAnswer, (state, {payload}) => {
        state.followUpAnswers.push(createInitialFollowUpTurn(payload));
      })
      .addCase(updateActiveFollowUpAnswerMessage, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }

        followUp.isLoading = false;
        followUp.isStreaming = true;
        if (!state.answer) {
          state.answer = '';
        }

        followUp.answer += payload.textDelta;
        delete followUp.error;
      })
      .addCase(updateActiveFollowUpAnswerCitations, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }

        followUp.isLoading = false;
        followUp.isStreaming = true;
        followUp.citations = filterOutDuplicatedCitations([
          ...followUp.citations,
          ...payload.citations,
        ]);
        delete followUp.error;
      })
      .addCase(updateActiveFollowUpError, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }

        followUp.isLoading = false;
        followUp.isStreaming = false;
        followUp.error = {
          ...payload,
          isRetryable: payload.code === RETRYABLE_STREAM_ERROR_CODE,
        };
        followUp.citations = [];
        delete followUp.answer;
      })
      .addCase(setActiveFollowUpIsLoading, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }
        followUp.isLoading = payload;
      })
      .addCase(setActiveFollowUpIsStreaming, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }
        followUp.isStreaming = payload;
      })
      .addCase(setActiveFollowUpAnswerContentFormat, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }
        followUp.answerContentFormat = payload;
      })
      .addCase(setActiveFollowUpAnswerId, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }
        followUp.answerId = payload;
      })
      .addCase(setActiveFollowUpIsAnswerGenerated, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }
        followUp.isAnswerGenerated = payload;
      })
      .addCase(setActiveFollowUpCannotAnswer, (state, {payload}) => {
        const followUp = getActiveFollowUp(state);
        if (!followUp) {
          return;
        }
        followUp.cannotAnswer = payload;
      })
);
