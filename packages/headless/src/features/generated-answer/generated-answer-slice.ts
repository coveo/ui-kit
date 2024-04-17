import {createReducer} from '@reduxjs/toolkit';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client';
import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  resetAnswer,
  setIsVisible,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
  sendGeneratedAnswerFeedback,
  registerFieldsToIncludeInCitations,
  setId,
  setAnswerMediaType,
  setRawAnswerMediaType,
  setIsAnswerGenerated,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

const convertMarkdownToHtml = (text: string): string => {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .processSync(text);

  return String(file);
};

export const Helpers = {
  convertMarkdownToHtml,
};

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(setIsVisible, (state, {payload}) => {
        state.isVisible = payload;
      })
      .addCase(setId, (state, {payload}) => {
        state.id = payload.id;
      })
      .addCase(updateMessage, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = true;
        if (!state.rawAnswer) {
          state.rawAnswer = '';
          state.answer = '';
        }

        state.rawAnswer += payload.textDelta;
        state.answer =
          state.rawAnswerMediaType === 'markdown'
            ? Helpers.convertMarkdownToHtml(state?.rawAnswer)
            : state.rawAnswer;
        state.answerMediaType =
          state.rawAnswerMediaType === 'markdown' ? 'html' : 'plain';
        delete state.error;
      })
      .addCase(updateCitations, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = true;
        state.citations = state.citations.concat(payload.citations);
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
      .addCase(setAnswerMediaType, (state, {payload}) => {
        state.answerMediaType = payload;
      })
      .addCase(setRawAnswerMediaType, (state, {payload}) => {
        state.rawAnswerMediaType = payload;
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
);
