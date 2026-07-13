import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {
  A2UISurface,
  GenerativeState,
  RoutedInterface,
  TurnStatus,
} from './generative-types.js';

type GenerativeActions = ReturnType<typeof createGenerativeActions>;

const CACHE_KEY: CacheKey<GenerativeActions> =
  createCacheKey<GenerativeActions>('generative/actions');

export function createGenerativeActions(interfaceId: string) {
  const prefix = `${interfaceId}/generative`;
  return {
    createTurn: createAction<{id: string; prompt: string; status: TurnStatus}>(
      `${prefix}/createTurn`
    ),
    setActiveTurnId: createAction<string>(`${prefix}/setActiveTurnId`),
    replaceTurnId: createAction<{oldId: string; newId: string}>(
      `${prefix}/replaceTurnId`
    ),
    setRoutedInterface: createAction<{
      turnId: string;
      routedInterface: RoutedInterface;
    }>(`${prefix}/setRoutedInterface`),
    initAgentResponse: createAction<{turnId: string}>(
      `${prefix}/initAgentResponse`
    ),
    startMessage: createAction<{turnId: string; role: string}>(
      `${prefix}/startMessage`
    ),
    appendMessageDelta: createAction<{turnId: string; delta: string}>(
      `${prefix}/appendMessageDelta`
    ),
    appendSurface: createAction<{turnId: string; surface: A2UISurface}>(
      `${prefix}/appendSurface`
    ),
    startToolCall: createAction<{
      turnId: string;
      toolCallId: string;
      toolName: string;
    }>(`${prefix}/startToolCall`),
    appendToolCallArgs: createAction<{
      turnId: string;
      toolCallId: string;
      delta: string;
    }>(`${prefix}/appendToolCallArgs`),
    completeToolCall: createAction<{
      turnId: string;
      toolCallId: string;
      result: string;
    }>(`${prefix}/completeToolCall`),
    completeTurn: createAction<{turnId: string}>(`${prefix}/completeTurn`),
    failTurn: createAction<{turnId: string; error: string}>(
      `${prefix}/failTurn`
    ),
    clearTurnResponse: createAction<{turnId: string}>(
      `${prefix}/clearTurnResponse`
    ),
    startReasoning: createAction<{turnId: string}>(`${prefix}/startReasoning`),
    appendReasoningDelta: createAction<{turnId: string; delta: string}>(
      `${prefix}/appendReasoningDelta`
    ),
    endReasoning: createAction<{turnId: string}>(`${prefix}/endReasoning`),
    hydrateState: createAction<GenerativeState>(`${prefix}/hydrateState`),
  };
}

export function getOrCreateGenerativeActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createGenerativeActions(stateId)
  );
}
