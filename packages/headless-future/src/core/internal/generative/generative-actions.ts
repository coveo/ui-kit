import {createAction} from '@reduxjs/toolkit';
import type {
  A2UISurface,
  AgentMessage,
  RoutedInterface,
  TurnStatus,
} from '@/src/core/interface/generative/generative-types.js';

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
    appendMessage: createAction<{turnId: string; message: AgentMessage}>(
      `${prefix}/appendMessage`
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
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createGenerativeActions>
>();

export function getOrCreateGenerativeActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createGenerativeActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
