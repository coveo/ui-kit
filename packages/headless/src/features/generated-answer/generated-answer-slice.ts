import {createReducer} from '@reduxjs/toolkit';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client.js';
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
import {getGeneratedAnswerInitialState} from './generated-answer-state.js';
import {filterOutDuplicatedCitations} from './utils/generated-answer-citation-utils.js';

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
);
