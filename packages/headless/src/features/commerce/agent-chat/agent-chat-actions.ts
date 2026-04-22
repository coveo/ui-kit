import {createAction} from '@reduxjs/toolkit';
import type {
  AgentChatActivityOwnership,
  AgentChatError,
  AgentChatMessage,
  AgentChatTraceEntry,
} from './agent-chat-state.js';

const prefix = 'commerce/agentChat';

// ── Conversation lifecycle ──────────────────────────────────────

export interface BeginChatTurnPayload {
  userMessage: AgentChatMessage;
  assistantMessage: AgentChatMessage;
}

export const beginChatTurn = createAction<BeginChatTurnPayload>(
  `${prefix}/beginChatTurn`
);

export const clearConversation = createAction<{threadId: string}>(
  `${prefix}/clearConversation`
);

// ── Streaming text ──────────────────────────────────────────────

export interface AppendTextPayload {
  messageId: string;
  text: string;
}

export const appendAgentText = createAction<AppendTextPayload>(
  `${prefix}/appendText`
);

// ── Activities ──────────────────────────────────────────────────

export interface UpsertActivityPayload {
  messageId: string;
  activityId: string;
  activityType: string;
  data: Record<string, unknown>;
}

export const upsertAgentActivity = createAction<UpsertActivityPayload>(
  `${prefix}/upsertActivity`
);

export interface ApplyActivityDeltaPayload {
  messageId: string;
  activityId: string;
  activityType: string;
  patch: unknown[];
  sourceOwner?: AgentChatActivityOwnership;
}

export const applyAgentActivityDelta = createAction<ApplyActivityDeltaPayload>(
  `${prefix}/applyActivityDelta`
);

export interface HandoffActivityPayload {
  activityId: string;
}

export const handoffActivityToClient = createAction<HandoffActivityPayload>(
  `${prefix}/handoffActivity`
);

export interface ApplyClientPatchPayload {
  activityId: string;
  patch: unknown[];
}

export const applyClientActivityPatch = createAction<ApplyClientPatchPayload>(
  `${prefix}/applyClientPatch`
);

// ── Thread state ────────────────────────────────────────────────

export const setThreadStateSnapshot = createAction<Record<string, unknown>>(
  `${prefix}/setThreadStateSnapshot`
);

export const applyThreadStateDelta = createAction<unknown[]>(
  `${prefix}/applyThreadStateDelta`
);

// ── Streaming progress ──────────────────────────────────────────

export interface UpdateProgressPayload {
  steps?: string[];
  trace?: AgentChatTraceEntry[];
}

export const updateStreamingProgress = createAction<UpdateProgressPayload>(
  `${prefix}/updateStreamingProgress`
);

export interface AddProgressStepPayload {
  step: string;
}

export const addProgressStep = createAction<AddProgressStepPayload>(
  `${prefix}/addProgressStep`
);

export interface AddTraceEntryPayload {
  entry: AgentChatTraceEntry;
}

export const addTraceEntry = createAction<AddTraceEntryPayload>(
  `${prefix}/addTraceEntry`
);

export interface UpdateTraceEntryPayload {
  id: string;
  text?: string;
  status?: AgentChatTraceEntry['status'];
}

export const updateTraceEntry = createAction<UpdateTraceEntryPayload>(
  `${prefix}/updateTraceEntry`
);

export const markAllTraceCompleted = createAction(
  `${prefix}/markAllTraceCompleted`
);

export const persistMessageProgress = createAction<{messageId: string}>(
  `${prefix}/persistMessageProgress`
);

// ── Streaming lifecycle ─────────────────────────────────────────

export const setStreamingActive = createAction<boolean>(
  `${prefix}/setStreamingActive`
);

// ── Error ───────────────────────────────────────────────────────

export const setAgentChatError = createAction<AgentChatError | null>(
  `${prefix}/setError`
);

export const dismissAgentChatError = createAction(`${prefix}/dismissError`);
