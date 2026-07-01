import {createSlice} from '@reduxjs/toolkit';
import type {GenerativeState} from '@/src/core/interface/generative/generative-types.js';
import {getOrCreateGenerativeActions} from './generative-actions.js';

export const initialGenerativeState: GenerativeState = {
  turns: [],
  activeTurnId: undefined,
  conversationSessionId: undefined,
  conversationToken: undefined,
};

export function createGenerativeSlice(interfaceId: string) {
  const actions = getOrCreateGenerativeActions(interfaceId);

  return createSlice({
    name: `${interfaceId}/generative`,
    initialState: initialGenerativeState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(actions.createTurn, (state, {payload}) => {
          state.turns.push({
            id: payload.id,
            prompt: payload.prompt,
            status: 'streaming',
          });
        })
        .addCase(actions.setActiveTurnId, (state, {payload}) => {
          state.activeTurnId = payload;
        })
        .addCase(actions.replaceTurnId, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.oldId);
          if (turn) {
            turn.id = payload.newId;
            if (state.activeTurnId === payload.oldId) {
              state.activeTurnId = payload.newId;
            }
          }
        })
        .addCase(actions.initAgentResponse, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.agentResponse = {messages: [], surfaces: [], toolCalls: []};
          }
        })
        .addCase(actions.startMessage, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.messages.push({content: '', role: payload.role});
          }
        })
        .addCase(actions.appendMessageDelta, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          const messages = turn?.agentResponse?.messages;
          if (messages && messages.length > 0) {
            messages[messages.length - 1].content += payload.delta;
          }
        })
        .addCase(actions.appendSurface, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.surfaces.push(payload.surface);
          }
        })
        .addCase(actions.startToolCall, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.toolCalls.push({
              id: payload.toolCallId,
              name: payload.toolName,
              args: '',
              status: 'calling',
            });
          }
        })
        .addCase(actions.appendToolCallArgs, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          const toolCall = turn?.agentResponse?.toolCalls.find(
            (tc) => tc.id === payload.toolCallId
          );
          if (toolCall) {
            toolCall.args += payload.delta;
          }
        })
        .addCase(actions.completeToolCall, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          const toolCall = turn?.agentResponse?.toolCalls.find(
            (tc) => tc.id === payload.toolCallId
          );
          if (toolCall) {
            toolCall.result = payload.result;
            toolCall.status = 'completed';
          }
        })
        .addCase(actions.completeTurn, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.status = 'complete';
          }
        })
        .addCase(actions.failTurn, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.status = 'error';
            turn.error = payload.error;
          }
        })
        .addCase(actions.clearTurnResponse, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            delete turn.agentResponse;
            delete turn.error;
          }
        })
        .addCase(actions.setConversationSessionId, (state, {payload}) => {
          state.conversationSessionId = payload;
        })
        .addCase(actions.setConversationToken, (state, {payload}) => {
          state.conversationToken = payload;
        });
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createGenerativeSlice>>();

export function getOrCreateGenerativeSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createGenerativeSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
