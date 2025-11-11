import {createReducer} from '@reduxjs/toolkit';
import {
  addAnswer,
  markActiveAnswerComplete,
  resetConversation,
  updateActiveAnswer,
  updateActiveAnswerMessage,
  updateCitationsToActiveAnswer,
} from './multi-turn-conversation-actions.js';
import {
  type ConversationTurn,
  getMultiTurnConversationInitialState,
  type MultiTurnConversationState,
} from './multi-turn-conversation-state.js';

export const multiTurnReducer = createReducer<MultiTurnConversationState>(
  getMultiTurnConversationInitialState(),
  (builder) => {
    builder
      .addCase(resetConversation, (state, action) => {
        state.conversationId = action.payload.conversationId;
        state.answers = [];
      })
      .addCase(addAnswer, (state, action) => {
        const newAnswer: ConversationTurn = {
          answer: '',
          prompt: action.payload.prompt,
          citations: [],
          isStreaming: false,
          isLoading: true,
          error: null,
          cannotAnswer: false,
          answerContentFormat: 'text/plain',
        };
        state.answers.push(newAnswer);
      })
      .addCase(updateActiveAnswerMessage, (state, {payload}) => {
        const index = state.answers.length - 1;
        if (index >= 0) {
          state.answers[index] = {
            ...state.answers[index],
            isLoading: false,
            isStreaming: true,
            error: null,
            answer: (state.answers[index].answer || '') + payload.textDelta,
          };
        }
      })
      .addCase(updateActiveAnswer, (state, action) => {
        const index = state.answers.length - 1;
        if (index >= 0) {
          state.answers[index] = {
            ...state.answers[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateCitationsToActiveAnswer, (state, action) => {
        const index = state.answers.length - 1;
        if (index >= 0) {
          state.answers[index].citations = action.payload;
        }
      })
      .addCase(markActiveAnswerComplete, (state) => {
        const index = state.answers.length - 1;
        if (index >= 0) {
          state.answers[index].isLoading = false;
          state.answers[index].isStreaming = false;
        }
      });
  }
);
