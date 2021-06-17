import {createReducer} from '@reduxjs/toolkit';
import {QuestionAnswerDocumentIdentifier} from '../../controllers';
import {executeSearch} from '../search/search-actions';
import {
  collapseSmartSnippet,
  collapseSmartSnippetRelatedQuestion,
  dislikeSmartSnippet,
  expandSmartSnippet,
  expandSmartSnippetRelatedQuestion,
  likeSmartSnippet,
} from './question-answering-actions';
import {
  getQuestionAnsweringInitialState,
  QuestionAnsweringRelatedQuestionState,
} from './question-answering-state';

const findRelatedQuestionIdx = (
  relatedQuestions: QuestionAnsweringRelatedQuestionState[],
  identifier: QuestionAnswerDocumentIdentifier
) =>
  relatedQuestions.findIndex(
    (relatedQuestion) =>
      relatedQuestion.contentIdValue === identifier.contentIdValue &&
      relatedQuestion.contentIdKey === identifier.contentIdKey
  );

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
      })
      .addCase(dislikeSmartSnippet, (state) => {
        state.liked = false;
        state.disliked = true;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.relatedQuestions = action.payload.response.questionAnswer.relatedQuestions.map(
          (relatedQuestion) => ({
            contentIdKey: relatedQuestion.documentId.contentIdKey,
            contentIdValue: relatedQuestion.documentId.contentIdValue,
            expanded: false,
          })
        );
      })
      .addCase(expandSmartSnippetRelatedQuestion, (state, action) => {
        const idx = findRelatedQuestionIdx(
          state.relatedQuestions,
          action.payload as QuestionAnswerDocumentIdentifier
        );
        if (idx === -1) {
          return;
        }
        state.relatedQuestions[idx].expanded = true;
      })
      .addCase(collapseSmartSnippetRelatedQuestion, (state, action) => {
        const idx = findRelatedQuestionIdx(
          state.relatedQuestions,
          action.payload as QuestionAnswerDocumentIdentifier
        );
        if (idx === -1) {
          return;
        }
        state.relatedQuestions[idx].expanded = false;
      })
);
