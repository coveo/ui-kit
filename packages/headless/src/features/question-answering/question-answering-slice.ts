import {createReducer} from '@reduxjs/toolkit';
import type {QuestionAnswer} from '../../api/search/search/question-answering.js';
import {getObjectHash} from '../../utils/utils.js';
import {executeSearch} from '../search/search-actions.js';
import {
  closeFeedbackModal,
  collapseSmartSnippet,
  collapseSmartSnippetRelatedQuestion,
  dislikeSmartSnippet,
  expandSmartSnippet,
  expandSmartSnippetRelatedQuestion,
  likeSmartSnippet,
  openFeedbackModal,
} from './question-answering-actions.js';
import type {QuestionAnsweringUniqueIdentifierActionCreatorPayload} from './question-answering-document-id.js';
import {
  getQuestionAnsweringInitialState,
  type QuestionAnsweringRelatedQuestionState,
} from './question-answering-state.js';

const findRelatedQuestionIdx = (
  relatedQuestions: QuestionAnsweringRelatedQuestionState[],
  identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload
) =>
  relatedQuestions.findIndex(
    (relatedQuestion) =>
      relatedQuestion.questionAnswerId === identifier.questionAnswerId
  );

function hashQuestionAnswer({
  question,
  answerSnippet,
  documentId: {contentIdKey, contentIdValue},
}: QuestionAnswer) {
  return getObjectHash({
    question,
    answerSnippet,
    contentIdKey,
    contentIdValue,
  });
}

function buildQuestionAnsweringRelatedQuestionState(
  responseQuestionAnswer: QuestionAnswer,
  currentState?: QuestionAnsweringRelatedQuestionState
): QuestionAnsweringRelatedQuestionState {
  const id = hashQuestionAnswer(responseQuestionAnswer);
  if (currentState && id === currentState.questionAnswerId) {
    return currentState;
  }
  return {
    contentIdKey: responseQuestionAnswer.documentId.contentIdKey,
    contentIdValue: responseQuestionAnswer.documentId.contentIdValue,
    expanded: false,
    questionAnswerId: id,
  };
}

export const questionAnsweringReducer = createReducer(
  getQuestionAnsweringInitialState(),
  (builder) =>
    builder
      .addCase(expandSmartSnippet, (state) => {
        state.expanded = true;
      })
      .addCase(collapseSmartSnippet, (state) => {
        state.expanded = false;
      })
      .addCase(likeSmartSnippet, (state) => {
        state.liked = true;
        state.disliked = false;
        state.feedbackModalOpen = false;
      })
      .addCase(dislikeSmartSnippet, (state) => {
        state.liked = false;
        state.disliked = true;
      })
      .addCase(openFeedbackModal, (state) => {
        state.feedbackModalOpen = true;
      })
      .addCase(closeFeedbackModal, (state) => {
        state.feedbackModalOpen = false;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const relatedQuestions =
          action.payload.response.questionAnswer.relatedQuestions.map(
            (relatedQuestion, i) =>
              buildQuestionAnsweringRelatedQuestionState(
                relatedQuestion,
                state.relatedQuestions[i]
              )
          );
        const questionAnswerId = hashQuestionAnswer(
          action.payload.response.questionAnswer
        );
        if (state.questionAnswerId === questionAnswerId) {
          return {
            ...state,
            relatedQuestions,
          };
        }
        return {
          ...getQuestionAnsweringInitialState(),
          relatedQuestions,
          questionAnswerId,
        };
      })
      .addCase(
        expandSmartSnippetRelatedQuestion,
        (
          state,
          action: ReturnType<typeof expandSmartSnippetRelatedQuestion>
        ) => {
          const idx = findRelatedQuestionIdx(
            state.relatedQuestions,
            action.payload
          );
          if (idx === -1) {
            return;
          }
          state.relatedQuestions[idx].expanded = true;
        }
      )
      .addCase(collapseSmartSnippetRelatedQuestion, (state, action) => {
        const idx = findRelatedQuestionIdx(
          state.relatedQuestions,
          action.payload
        );
        if (idx === -1) {
          return;
        }
        state.relatedQuestions[idx].expanded = false;
      })
);
