import {createAction} from '@reduxjs/toolkit';
import type {
  AppendAgentChunkPayload,
  ConversationSession,
  FailTurnPayload,
  FinalizeTurnPayload,
  StartTurnPayload,
} from '@/src/core/interface/conversation/conversation-types.js';

const ACTION_PREFIX = 'conversation';

export const startTurn = createAction<StartTurnPayload>(
  `${ACTION_PREFIX}/startTurn`
);

export const appendAgentChunk = createAction<AppendAgentChunkPayload>(
  `${ACTION_PREFIX}/appendAgentChunk`
);

export const completeTurn = createAction<FinalizeTurnPayload>(
  `${ACTION_PREFIX}/completeTurn`
);

export const failTurn = createAction<FailTurnPayload>(
  `${ACTION_PREFIX}/failTurn`
);

export const abortTurn = createAction<FinalizeTurnPayload>(
  `${ACTION_PREFIX}/abortTurn`
);

export const setSession = createAction<ConversationSession>(
  `${ACTION_PREFIX}/setSession`
);

export const patchSession = createAction<ConversationSession>(
  `${ACTION_PREFIX}/patchSession`
);

export const setError = createAction<string | null>(
  `${ACTION_PREFIX}/setError`
);

export const setStreamingConnected = createAction<boolean>(
  `${ACTION_PREFIX}/setStreamingConnected`
);
