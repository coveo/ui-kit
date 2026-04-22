import {createReducer} from '@reduxjs/toolkit';
import {applyJsonPatch} from './utils/json-patch.js';
import {
  type AgentChatState,
  type AgentChatMessage,
  type AgentChatActivity,
  getAgentChatInitialState,
} from './agent-chat-state.js';
import {
  addProgressStep,
  addTraceEntry,
  appendAgentText,
  applyAgentActivityDelta,
  applyClientActivityPatch,
  applyThreadStateDelta,
  beginChatTurn,
  clearConversation,
  dismissAgentChatError,
  handoffActivityToClient,
  markAllTraceCompleted,
  persistMessageProgress,
  setAgentChatError,
  setStreamingActive,
  setThreadStateSnapshot,
  updateStreamingProgress,
  updateTraceEntry,
  upsertAgentActivity,
} from './agent-chat-actions.js';

export const agentChatReducer = createReducer(
  getAgentChatInitialState(),
  (builder) => {
    builder
      // ── Conversation lifecycle ──────────────────────────────
      .addCase(beginChatTurn, (state, action) => {
        const {userMessage, assistantMessage} = action.payload;
        state.conversation.messages.push(userMessage, assistantMessage);
        state.streaming.isActive = true;
        state.streaming.currentMessageId = assistantMessage.id;
        state.streaming.progress = {steps: [], trace: []};
        state.error = null;
      })

      .addCase(clearConversation, (state, action) => {
        const fresh = getAgentChatInitialState(action.payload.threadId);
        state.conversation = fresh.conversation;
        state.streaming = fresh.streaming;
        state.threadState = fresh.threadState;
        state.error = fresh.error;
      })

      // ── Streaming text ──────────────────────────────────────
      .addCase(appendAgentText, (state, action) => {
        const {messageId, text} = action.payload;
        if (!text) {
          return;
        }
        const message = findMessage(state, messageId);
        if (message) {
          message.content += text;
        }
      })

      // ── Activities ──────────────────────────────────────────
      .addCase(upsertAgentActivity, (state, action) => {
        const {messageId, activityId, activityType, data} = action.payload;
        const message = findMessage(state, messageId);
        if (!message) {
          return;
        }

        const existing = message.activities.find((a) => a.id === activityId);
        if (existing) {
          existing.data = data;
        } else {
          message.activities.push({
            id: activityId,
            type: activityType,
            data,
            ownership: 'backend',
          });
        }
      })

      .addCase(applyAgentActivityDelta, (state, action) => {
        const {
          messageId,
          activityId,
          patch,
          sourceOwner = 'backend',
        } = action.payload;
        const message = findMessage(state, messageId);
        if (!message) {
          return;
        }

        const activity = message.activities.find((a) => a.id === activityId);
        if (!activity) {
          return;
        }

        // Ownership guard: backend cannot patch client-owned activities
        if (sourceOwner === 'backend' && activity.ownership === 'client') {
          return;
        }
        // Client can only patch client-owned activities
        if (sourceOwner === 'client' && activity.ownership !== 'client') {
          return;
        }

        activity.data = applyJsonPatch(activity.data, patch);
      })

      .addCase(handoffActivityToClient, (state, action) => {
        const {activityId} = action.payload;
        const activity = findActivity(state, activityId);
        if (activity) {
          activity.ownership = 'client';
        }
      })

      .addCase(applyClientActivityPatch, (state, action) => {
        const {activityId, patch} = action.payload;
        const activity = findActivity(state, activityId);
        if (activity && activity.ownership === 'client') {
          activity.data = applyJsonPatch(activity.data, patch);
        }
      })

      // ── Thread state ────────────────────────────────────────
      .addCase(setThreadStateSnapshot, (state, action) => {
        state.threadState = action.payload;
      })

      .addCase(applyThreadStateDelta, (state, action) => {
        state.threadState = applyJsonPatch(state.threadState, action.payload);
      })

      // ── Streaming progress ──────────────────────────────────
      .addCase(updateStreamingProgress, (state, action) => {
        if (action.payload.steps !== undefined) {
          state.streaming.progress.steps = action.payload.steps;
        }
        if (action.payload.trace !== undefined) {
          state.streaming.progress.trace = action.payload.trace;
        }
      })

      .addCase(addProgressStep, (state, action) => {
        const {step} = action.payload;
        const {steps} = state.streaming.progress;

        // Dedup: don't add if last step is the same
        if (steps[steps.length - 1] === step) {
          return;
        }

        // Collapsible steps (reasoning, tool) — only add once
        const isCollapsible =
          step === 'Reasoning...' || step.startsWith('Tool: ');
        if (isCollapsible && steps.includes(step)) {
          return;
        }

        steps.push(step);
      })

      .addCase(addTraceEntry, (state, action) => {
        const {entry} = action.payload;
        const {trace} = state.streaming.progress;

        // For reasoning: merge with existing trailing reasoning entry
        if (entry.kind === 'reasoning') {
          const last = trace[trace.length - 1];
          if (last?.kind === 'reasoning') {
            last.id = entry.id;
            last.status = 'streaming';
            return;
          }
        }

        // Don't add duplicates
        if (trace.some((e) => e.id === entry.id && e.kind === entry.kind)) {
          return;
        }

        trace.push(entry);
      })

      .addCase(updateTraceEntry, (state, action) => {
        const {id, text, status} = action.payload;
        const entry = state.streaming.progress.trace.find((e) => e.id === id);
        if (!entry) {
          return;
        }
        if (text !== undefined) {
          entry.text += text;
        }
        if (status !== undefined) {
          entry.status = status;
        }
      })

      .addCase(markAllTraceCompleted, (state) => {
        for (const entry of state.streaming.progress.trace) {
          entry.status = 'completed';
        }
      })

      .addCase(persistMessageProgress, (state, action) => {
        const {messageId} = action.payload;
        const message = findMessage(state, messageId);
        if (!message) {
          return;
        }

        const {steps, trace} = state.streaming.progress;
        if (steps.length > 0 || trace.length > 0) {
          message.progress = {
            steps: [...steps],
            trace: trace.map((e) => ({...e})),
          };
        }

        state.streaming.progress = {steps: [], trace: []};
      })

      // ── Streaming lifecycle ─────────────────────────────────
      .addCase(setStreamingActive, (state, action) => {
        state.streaming.isActive = action.payload;
        if (!action.payload) {
          state.streaming.currentMessageId = null;
        }
      })

      // ── Error ───────────────────────────────────────────────
      .addCase(setAgentChatError, (state, action) => {
        state.error = action.payload;
      })

      .addCase(dismissAgentChatError, (state) => {
        state.error = null;
      });
  }
);

// ── Helpers ─────────────────────────────────────────────────────

function findMessage(
  state: AgentChatState,
  messageId: string
): AgentChatMessage | undefined {
  return state.conversation.messages.find((m) => m.id === messageId);
}

function findActivity(
  state: AgentChatState,
  activityId: string
): AgentChatActivity | undefined {
  for (const message of state.conversation.messages) {
    const activity = message.activities.find((a) => a.id === activityId);
    if (activity) {
      return activity;
    }
  }
  return undefined;
}
