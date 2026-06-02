import {createSlice} from '@reduxjs/toolkit';
import type {
  ConversationState,
  ConversationTurn,
} from '@/src/core/interface/conversation/conversation-types.js';
import * as conversationActions from './conversation-actions.js';

export const initialConversationState: ConversationState = {
  messages: [],
  turns: [],
  activeTurnId: null,
  session: {},
  isLoading: false,
  error: null,
  streaming: {
    isConnected: false,
  },
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState: initialConversationState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(conversationActions.startTurn, (state, action) => {
      const {turnId, userMessageId, agentMessageId, input, createdAt} =
        action.payload;

      state.messages.push(
        {
          id: userMessageId,
          role: 'user',
          content: input,
          createdAt,
        },
        {
          id: agentMessageId,
          role: 'agent',
          content: '',
          createdAt,
        }
      );
      state.turns.push({
        id: turnId,
        messageIds: [userMessageId, agentMessageId],
        status: {type: 'pending'},
        createdAt,
      });
      state.activeTurnId = turnId;
      state.isLoading = true;
      state.error = null;
      state.streaming.isConnected = false;
    });
    builder.addCase(conversationActions.appendAgentChunk, (state, action) => {
      const turnIndex = getTurnIndex(state, action.payload.turnId);

      if (turnIndex === -1) {
        return;
      }

      const turn = state.turns[turnIndex];
      const messageIndex = getAgentMessageIndex(state, turn);

      if (messageIndex === -1) {
        return;
      }

      state.messages[messageIndex].content += action.payload.chunk;
      state.turns[turnIndex].status = {type: 'streaming'};
      state.streaming.isConnected = true;
    });
    builder.addCase(conversationActions.completeTurn, (state, action) => {
      const turnIndex = getTurnIndex(state, action.payload.turnId);

      if (turnIndex === -1) {
        return;
      }

      state.turns[turnIndex].status = {type: 'completed'};
      state.turns[turnIndex].finalizedAt = action.payload.finalizedAt;
      state.activeTurnId = null;
      state.isLoading = false;
      state.streaming.isConnected = false;
    });
    builder.addCase(conversationActions.failTurn, (state, action) => {
      const turnIndex = getTurnIndex(state, action.payload.turnId);

      if (turnIndex === -1) {
        return;
      }

      state.turns[turnIndex].status = {
        type: 'failed',
        reason: action.payload.reason,
      };
      state.turns[turnIndex].finalizedAt = action.payload.finalizedAt;
      state.activeTurnId = null;
      state.isLoading = false;
      state.streaming.isConnected = false;
    });
    builder.addCase(conversationActions.abortTurn, (state, action) => {
      const turnIndex = getTurnIndex(state, action.payload.turnId);

      if (turnIndex === -1) {
        return;
      }

      const turn = state.turns[turnIndex];
      const messageIndex = getAgentMessageIndex(state, turn);

      if (messageIndex !== -1 && state.messages[messageIndex].content === '') {
        const [removedMessage] = state.messages.splice(messageIndex, 1);
        state.turns[turnIndex].messageIds = turn.messageIds.filter(
          (messageId) => messageId !== removedMessage.id
        );
      }

      state.turns[turnIndex].status = {
        type: 'aborted',
        reason: 'user_aborted',
      };
      state.turns[turnIndex].finalizedAt = action.payload.finalizedAt;
      state.activeTurnId = null;
      state.isLoading = false;
      state.streaming.isConnected = false;
    });
    builder.addCase(conversationActions.setSession, (state, action) => {
      state.session = action.payload;
    });
    builder.addCase(conversationActions.patchSession, (state, action) => {
      state.session = {
        ...state.session,
        ...action.payload,
      };
    });
    builder.addCase(conversationActions.setError, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(
      conversationActions.setStreamingConnected,
      (state, action) => {
        state.streaming.isConnected = action.payload;
      }
    );
  },
  selectors: {
    messages: (state) => state.messages,
    turns: (state) => state.turns,
    activeTurnId: (state) => state.activeTurnId,
    session: (state) => state.session,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    streaming: (state) => state.streaming,
  },
});

const getTurnIndex = (state: ConversationState, turnId: string) =>
  state.turns.findIndex((turn) => turn.id === turnId);

const getAgentMessageIndex = (
  state: ConversationState,
  turn: ConversationTurn
) => {
  const agentMessageId = turn.messageIds.findLast((messageId) =>
    state.messages.some(
      (message) => message.id === messageId && message.role === 'agent'
    )
  );

  if (!agentMessageId) {
    return -1;
  }

  return state.messages.findIndex((message) => message.id === agentMessageId);
};
