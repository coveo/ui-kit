/**
 * Conversation Feature Slice (Redux Implementation)
 *
 * INTERNAL to Layer 0. NEVER export from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  ConversationState,
  ConversationMessage,
  ConversationTurn,
  ConversationSession,
  ConversationWarningCode,
  StructuredConversationError,
  TurnStatus,
} from '@/src/core/interface/conversation/types.js';

const now = () => Date.now();

export const initialConversationSession: ConversationSession = {
  sessionId: '',
  createdAt: 0,
  updatedAt: 0,
};

export const initialConversationState: ConversationState = {
  messages: [],
  turns: [],
  activeTurnId: null,
  session: initialConversationSession,
  isLoading: false,
  error: null,
  structuredError: null,
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState: initialConversationState,
  reducers: {
    rehydrateConversation: (
      _state,
      action: PayloadAction<ConversationState>
    ) => {
      return action.payload;
    },
    addMessage: (state, action: PayloadAction<ConversationMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (
      state,
      action: PayloadAction<{id: string; updates: Partial<ConversationMessage>}>
    ) => {
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...action.payload.updates,
        };
      }
    },
    appendMessageContent: (
      state,
      action: PayloadAction<{id: string; delta: string}>
    ) => {
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index].content += action.payload.delta;
      }
    },
    addTurn: (state, action: PayloadAction<ConversationTurn>) => {
      state.turns.push(action.payload);
    },
    updateTurnStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: TurnStatus;
        finalizedAt?: number;
        reason?: string;
        assistantMessageId?: string;
        warningCodes?: ConversationWarningCode[];
      }>
    ) => {
      const turn = state.turns.find((t) => t.id === action.payload.id);
      if (turn) {
        turn.status = action.payload.status;
        if (action.payload.finalizedAt !== undefined) {
          turn.finalizedAt = action.payload.finalizedAt;
        }
        if (action.payload.reason !== undefined) {
          turn.reason = action.payload.reason;
        }
        if (action.payload.assistantMessageId !== undefined) {
          turn.assistantMessageId = action.payload.assistantMessageId;
        }
        if (action.payload.warningCodes?.length) {
          const existing = turn.warningCodes ?? [];
          turn.warningCodes = Array.from(
            new Set([...existing, ...action.payload.warningCodes])
          );
        }
      }
    },
    addTurnWarnings: (
      state,
      action: PayloadAction<{
        id: string;
        warningCodes: ConversationWarningCode[];
      }>
    ) => {
      const turn = state.turns.find((t) => t.id === action.payload.id);
      if (!turn || action.payload.warningCodes.length === 0) {
        return;
      }

      const existing = turn.warningCodes ?? [];
      turn.warningCodes = Array.from(
        new Set([...existing, ...action.payload.warningCodes])
      );
    },
    setActiveTurnId: (state, action: PayloadAction<string | null>) => {
      state.activeTurnId = action.payload;
    },
    updateSession: (
      state,
      action: PayloadAction<Partial<ConversationSession>>
    ) => {
      state.session = {...state.session, ...action.payload, updatedAt: now()};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setStructuredError: (
      state,
      action: PayloadAction<StructuredConversationError | null>
    ) => {
      state.structuredError = action.payload;
    },
    clearConversation: (state) => {
      state.messages = [];
      state.turns = [];
      state.activeTurnId = null;
      state.session = {
        ...initialConversationSession,
        createdAt: now(),
        updatedAt: now(),
      };
      state.isLoading = false;
      state.error = null;
      state.structuredError = null;
    },
  },
  selectors: {
    messages: (state) => state.messages,
    turns: (state) => state.turns,
    activeTurnId: (state) => state.activeTurnId,
    session: (state) => state.session,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    structuredError: (state) => state.structuredError,
  },
});
