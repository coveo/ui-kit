import {createReducer} from '@reduxjs/toolkit';
import {
  collapseSmartSnippet,
  dislikeSmartSnippet,
  expandSmartSnippet,
  likeSmartSnippet,
} from './question-answering-actions';
import {getQuestionAnsweringInitialState} from './question-answering-state';

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
);
