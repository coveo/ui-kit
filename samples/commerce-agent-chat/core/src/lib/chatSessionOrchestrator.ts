import type {BaseEvent} from '@ag-ui/client';
import type {Observable, Subscription} from 'rxjs';

import type {CommerceConfig} from '../config/env.js';
import type {
  AgentInvocation,
  ChatState,
  Message,
  ProgressTraceEntry,
} from '../types/agent.js';

import {CommerceAgentClient} from './agentClient.js';
import {buildInvocationMessages} from './chatContextBuilder.js';
import {
  type ActivityOwner,
  applyClientActivityDeltaById,
  applyParsedEventToStore,
  applyThreadStateDelta,
  beginChatTurn,
  clearChatSession,
  createChatSessionStore,
  createPendingChatTurn,
  dismissChatError,
  getActivityOwnership,
  handoffActivityToClient,
  selectChatState,
  setChatError,
  setChatLoading,
  setActivityOwner,
  setThreadStateSnapshot,
  updateProgressSteps,
  updateProgressTrace,
  type ChatSessionStore,
} from './chatStore.js';
import {extractStreamingProgress, parseAgentEvent} from './streamParser.js';

interface ChatAgentClient {
  invoke(
    messages: Message[],
    threadId: string,
    threadState?: Record<string, unknown>
  ): AgentInvocation;
}

interface ChatSessionUpdate {
  state: ChatState;
  immediate?: boolean;
}

type ChatSessionListener = (update: ChatSessionUpdate) => void;

export class ChatSessionOrchestrator {
  private readonly client: ChatAgentClient;
  private readonly store: ChatSessionStore;
  private readonly config: CommerceConfig;
  private activeSubscription: Subscription | null = null;
  private listeners = new Set<ChatSessionListener>();

  constructor(config: CommerceConfig, client?: ChatAgentClient) {
    this.config = config;
    this.client = client ?? new CommerceAgentClient(config);
    this.store = createChatSessionStore(undefined, config);
  }

  getState(): ChatState {
    return selectChatState(this.store);
  }

  getStore(): ChatSessionStore {
    return this.store;
  }

  setActivityOwner(activityId: string, owner: ActivityOwner): void {
    setActivityOwner(this.store, activityId, owner);
  }

  getActivityOwner(activityId: string): ActivityOwner | undefined {
    return getActivityOwnership(this.store, activityId)?.owner;
  }

  getConfig(): CommerceConfig {
    return this.config;
  }

  getEnvFromStore(): CommerceConfig | null {
    return this.store.getState().env;
  }

  getSearchResults() {
    return this.store.getState().searchResults;
  }

  handoffActivityToClient(activityId: string): boolean {
    const didHandoff = handoffActivityToClient(this.store, activityId);
    if (didHandoff) {
      this.emitState();
    }

    return didHandoff;
  }

  applyClientActivityPatch(activityId: string, patch: unknown[]): boolean {
    const didApply = applyClientActivityDeltaById(
      this.store,
      activityId,
      patch
    );
    if (didApply) {
      this.emitState();
    }

    return didApply;
  }

  subscribe(listener: ChatSessionListener): () => void {
    this.listeners.add(listener);
    listener({state: this.getState()});
    return () => {
      this.listeners.delete(listener);
    };
  }

  sendMessage(content: string): void {
    const trimmed = content.trim();
    if (!trimmed || this.getState().isLoading) {
      return;
    }

    this.activeSubscription?.unsubscribe();
    const sessionState = this.store.getState();
    const historyForAgent = buildInvocationMessages(sessionState.messages);
    const turn = createPendingChatTurn(trimmed);
    const {events} = this.client.invoke(
      [...historyForAgent, turn.userMessage],
      sessionState.threadId,
      sessionState.threadState
    );

    beginChatTurn(this.store, turn);
    this.emitState(false);

    let hasTextMessageStarted = false;
    const assistantMessageId = turn.assistantMessage.id;

    this.activeSubscription = events.subscribe({
      next: (event: BaseEvent) => {
        const eventType = String(
          (event as Record<string, unknown>).type ?? ''
        ).toUpperCase();

        if (eventType === 'TEXT_MESSAGE_START') {
          hasTextMessageStarted = true;
        }

        if (eventType === 'STATE_SNAPSHOT') {
          const snapshot = (event as Record<string, unknown>).snapshot;
          if (snapshot && typeof snapshot === 'object') {
            setThreadStateSnapshot(
              this.store,
              snapshot as Record<string, unknown>
            );
          }
        }

        if (eventType === 'STATE_DELTA') {
          const delta = (event as Record<string, unknown>).delta;
          if (Array.isArray(delta)) {
            applyThreadStateDelta(this.store, delta);
          }
        }

        if (eventType === 'RUN_FINISHED') {
          updateProgressSteps(this.store, (steps) =>
            this.appendProgressStep(steps, 'Done')
          );
          updateProgressTrace(this.store, (trace) =>
            this.markAllProgressTraceCompleted(trace)
          );
          this.emitState(true);
        }

        const progressStep = extractStreamingProgress(event);
        if (progressStep !== undefined) {
          updateProgressSteps(this.store, (steps) =>
            this.appendProgressStep(steps, progressStep)
          );
          this.emitState(true);
        }

        const previousTrace = this.getState().progressTrace;
        const progressTrace = this.applyProgressTraceEvent(
          previousTrace,
          event
        );
        if (progressTrace !== previousTrace) {
          updateProgressTrace(this.store, () => progressTrace);
          this.emitState(true);
        }

        const parsed = parseAgentEvent(event);
        if (parsed.type === 'message' && !hasTextMessageStarted) {
          return;
        }

        if (parsed.type !== 'lifecycle') {
          applyParsedEventToStore(this.store, assistantMessageId, parsed);
          if (parsed.type === 'message') {
            this.emitState();
            return;
          }

          if (
            parsed.type === 'activity_snapshot' ||
            parsed.type === 'activity_delta' ||
            parsed.type === 'error'
          ) {
            this.emitState();
          }
        }
      },
      error: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Stream error occurred';
        setChatError(this.store, message);
        setChatLoading(this.store, false);
        updateProgressSteps(this.store, (steps) =>
          this.appendProgressStep(steps, 'Response failed')
        );
        updateProgressTrace(this.store, (trace) =>
          this.markAllProgressTraceCompleted(trace)
        );
        this.emitState();
      },
      complete: () => {
        const currentState = this.getState();
        const hasDoneStep = currentState.progressSteps.includes('Done');

        setChatLoading(this.store, false);
        if (!hasDoneStep) {
          updateProgressSteps(this.store, (steps) =>
            this.appendProgressStep(steps, 'Response complete')
          );
        }
        updateProgressTrace(this.store, (trace) =>
          this.markAllProgressTraceCompleted(trace)
        );
        this.emitState();
      },
    });
  }

  clearMessages(): void {
    this.activeSubscription?.unsubscribe();
    this.activeSubscription = null;
    clearChatSession(this.store);
    this.emitState();
  }

  dismissError(): void {
    dismissChatError(this.store);
    this.emitState();
  }

  dispose(): void {
    this.activeSubscription?.unsubscribe();
    this.activeSubscription = null;
    this.listeners.clear();
  }

  private emitState(immediate = false): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener({state, immediate});
    }
  }

  private appendProgressStep(existing: string[], step: string): string[] {
    if (existing[existing.length - 1] === step) {
      return existing;
    }

    const isCollapsibleStep =
      step === 'Reasoning...' || step.startsWith('Tool: ');

    if (isCollapsibleStep && existing.includes(step)) {
      return existing;
    }

    return [...existing, step];
  }

  private applyProgressTraceEvent(
    existing: ProgressTraceEntry[],
    event: BaseEvent
  ): ProgressTraceEntry[] {
    const typedEvent = event as Record<string, unknown>;
    const eventType = String(typedEvent.type ?? '').toUpperCase();

    if (eventType === 'REASONING_MESSAGE_START') {
      const messageId = String(
        typedEvent.messageId ?? `reasoning-${Date.now()}`
      );
      return this.appendReasoningEntry(existing, messageId);
    }

    if (eventType === 'REASONING_START') {
      const messageId = String(
        typedEvent.messageId ?? `reasoning-${Date.now()}`
      );
      return this.appendReasoningEntry(existing, messageId);
    }

    if (
      eventType === 'REASONING_MESSAGE_CONTENT' ||
      eventType === 'REASONING_MESSAGE_CHUNK'
    ) {
      const messageId = String(typedEvent.messageId ?? 'reasoning');
      const delta = String(typedEvent.delta ?? '');
      if (!delta) {
        return existing;
      }

      return existing.map((entry) =>
        entry.id === messageId && entry.kind === 'reasoning'
          ? {
              ...entry,
              text: `${entry.text}${delta}`,
              status: 'streaming' as const,
            }
          : entry
      );
    }

    if (
      eventType === 'REASONING_MESSAGE_END' ||
      eventType === 'REASONING_END'
    ) {
      const messageId = String(typedEvent.messageId ?? 'reasoning');

      return existing.map((entry) =>
        entry.id === messageId && entry.kind === 'reasoning'
          ? {
              ...entry,
              status: 'completed' as const,
            }
          : entry
      );
    }

    if (eventType === 'TOOL_CALL_START') {
      const toolCallId = String(typedEvent.toolCallId ?? `tool-${Date.now()}`);
      const toolCallName = String(typedEvent.toolCallName ?? 'tool');

      const hasEntry = existing.some(
        (entry) => entry.id === toolCallId && entry.kind === 'tool'
      );

      if (hasEntry) {
        return existing;
      }

      return [
        ...existing,
        {
          id: toolCallId,
          kind: 'tool' as const,
          label: toolCallName,
          text: '',
          status: 'streaming' as const,
        },
      ];
    }

    if (eventType === 'TOOL_CALL_END') {
      const toolCallId = String(typedEvent.toolCallId ?? 'tool');

      return existing.map((entry) =>
        entry.id === toolCallId && entry.kind === 'tool'
          ? {
              ...entry,
              status: 'completed' as const,
            }
          : entry
      );
    }

    return existing;
  }

  private appendReasoningEntry(
    existing: ProgressTraceEntry[],
    id: string
  ): ProgressTraceEntry[] {
    const lastEntry = existing[existing.length - 1];

    if (lastEntry?.kind === 'reasoning') {
      return [
        ...existing.slice(0, -1),
        {
          ...lastEntry,
          // Keep existing text and label, but move tracking to latest reasoning id.
          id,
          status: 'streaming' as const,
        },
      ];
    }

    const hasEntry = existing.some(
      (entry) => entry.id === id && entry.kind === 'reasoning'
    );

    if (hasEntry) {
      return existing;
    }

    return [
      ...existing,
      {
        id,
        kind: 'reasoning' as const,
        label: 'Reasoning',
        text: '',
        status: 'streaming' as const,
      },
    ];
  }

  private markAllProgressTraceCompleted(
    existing: ProgressTraceEntry[]
  ): ProgressTraceEntry[] {
    if (!existing.some((entry) => entry.status === 'streaming')) {
      return existing;
    }

    return existing.map((entry) => ({
      ...entry,
      status: 'completed' as const,
    }));
  }
}
