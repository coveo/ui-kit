import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {
  A2UISurface,
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
  };
}

export const getOrCreateGenerativeActions = SingletonFactory(
  createGenerativeActions
);
