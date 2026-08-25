import {createSlice} from '@reduxjs/toolkit';
import type {GenerativeState, ToolCallStep} from './generative-types.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeActions} from './generative-actions.js';

export const initialGenerativeState: GenerativeState = {
  turns: [],
  activeTurnId: undefined,
  conversationSessionId: undefined,
  conversationToken: undefined,
};

type GenerativeSlice = ReturnType<typeof createGenerativeSlice>;

const CACHE_KEY: CacheKey<GenerativeSlice> = createCacheKey<GenerativeSlice>('generative/slice');

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
          const existingIndex = state.turns.findIndex((t) => t.id === payload.id);
          const newTurn = {
            id: payload.id,
            prompt: payload.prompt,
            status: payload.status,
          };
          if (existingIndex >= 0) {
            state.turns[existingIndex] = newTurn;
          } else {
            state.turns.push(newTurn);
          }
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
            if (payload.useCase === 'decomposedCommerce') {
              turn.routedInterface = {
                useCase: 'decomposedCommerce',
                surfaceType: payload.surfaceType ?? '',
                surfaceId: payload.surfaceId ?? '',
              };
            } else {
              turn.routedInterface = {useCase: payload.useCase};
            }
          }
        })
        .addCase(actions.clearRoutedInterface, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            delete turn.routedInterface;
          }
        })
        .addCase(actions.initAgentResponse, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn) {
            turn.agentResponse = {
              state: {},
              messages: [],
              surfaces: [],
              activities: [],
              reasoningSteps: [],
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
        .addCase(actions.appendActivity, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.activities.push(payload.activity);
          }
        })
        .addCase(actions.setStateSnapshot, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.state = payload.state;
          }
        })
        .addCase(actions.appendSurface, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            const activityId = payload.activity?.id;
            if (activityId && payload.activity?.replace) {
              const existingIndex = turn.agentResponse.surfaces.findIndex(
                (surface) => surface.__thermidorActivityId === activityId
              );
              const replacementSurface = {
                ...payload.surface,
                __thermidorActivityId: activityId,
              };
              if (existingIndex >= 0) {
                turn.agentResponse.surfaces[existingIndex] = replacementSurface;
              } else {
                turn.agentResponse.surfaces.push(replacementSurface);
              }
            } else {
              turn.agentResponse.surfaces.push(payload.surface);
            }
          }
        })
        .addCase(actions.startToolCall, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.reasoningSteps.push({
              type: 'tool-call',
              id: payload.toolCallId,
              name: payload.toolName,
              args: '',
              status: 'calling',
            });
          }
        })
        .addCase(actions.appendToolCallArgs, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          const step = turn?.agentResponse?.reasoningSteps.find(
            (s): s is ToolCallStep => s.type === 'tool-call' && s.id === payload.toolCallId
          );
          if (step) {
            step.args += payload.delta;
          }
        })
        .addCase(actions.completeToolCall, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          const step = turn?.agentResponse?.reasoningSteps.find(
            (s): s is ToolCallStep => s.type === 'tool-call' && s.id === payload.toolCallId
          );
          if (step) {
            step.result = payload.result;
            step.status = 'completed';
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
            delete turn.routedInterface;
            delete turn.agentResponse;
            delete turn.error;
          }
        })
        .addCase(actions.startReasoning, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          if (turn?.agentResponse) {
            turn.agentResponse.reasoningSteps.push({
              type: 'reasoning',
              content: '',
            });
          }
        })
        .addCase(actions.appendReasoningDelta, (state, {payload}) => {
          const turn = state.turns.find((t) => t.id === payload.turnId);
          const steps = turn?.agentResponse?.reasoningSteps;
          if (steps) {
            if (!steps.some((s) => s.type === 'reasoning')) {
              steps.push({type: 'reasoning', content: ''});
            }
            const last = steps.findLast((s) => s.type === 'reasoning')!;
            last.content += payload.delta;
          }
        })
        .addCase(actions.endReasoning, (_state, _action) => {
          // No-op: reasoning end is a lifecycle signal only.
        })
        .addCase(actions.hydrateState, (_state, {payload}) => {
          return payload;
        })
        .addCase(actions.setConversationSession, (state, {payload}) => {
          state.conversationSessionId = payload.sessionId;
          state.conversationToken = payload.token;
        });
    },
  });
}

export function getOrCreateGenerativeSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateGenerativeActions(iface);
    return createGenerativeSlice(stateId, actions);
  });
}
