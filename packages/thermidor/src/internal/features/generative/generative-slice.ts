import {createSlice} from '@reduxjs/toolkit';
import type {GenerativeState} from './generative-types.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeActions} from './generative-actions.js';

export const initialGenerativeState: GenerativeState = {
  turns: [],
  activeTurnId: undefined,
};

type GenerativeSlice = ReturnType<typeof createGenerativeSlice>;

const CACHE_KEY: CacheKey<GenerativeSlice> =
  createCacheKey<GenerativeSlice>('generative/slice');

export function createGenerativeSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateGenerativeActions>
) {
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
            stateSnapshot: null,
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
        .addCase(actions.setRoutedInterface, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.routedInterface = payload.routedInterface;
            turn.status = 'complete';
          }
        })
        .addCase(actions.initAgentResponse, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.agentResponse = {
              messages: [],
              surfaces: [],
              toolCalls: [],
              reasoningContent: '',
            };
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
            turn.stateSnapshot = null;
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
            delete turn.routedInterface;
            delete turn.agentResponse;
            delete turn.error;
          }
        })
        .addCase(actions.startReasoning, (_state, _action) => {
          // No-op: reasoning start is a lifecycle signal only.
        })
        .addCase(actions.appendReasoningDelta, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.reasoningContent += payload.delta;
          }
        })
        .addCase(actions.endReasoning, (_state, _action) => {
          // No-op: reasoning end is a lifecycle signal only.
        })
        .addCase(actions.setStateSnapshot, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.stateSnapshot = payload.snapshot;
          }
        })
        .addCase(actions.hydrateState, (_state, {payload}) => {
          return payload;
        });
    },
  });
}

export function getOrCreateGenerativeSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateGenerativeActions(iface);
    return createGenerativeSlice(stateId, actions);
  });
}
