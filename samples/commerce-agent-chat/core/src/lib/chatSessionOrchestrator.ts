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
import {generateId} from './chatIds.js';
import {applyParsedEventToChatState} from './chatEngine.js';
import {extractStreamingProgress, parseAgentEvent} from './streamParser.js';

interface ChatAgentClient {
  invoke(messages: Message[], threadId: string): AgentInvocation;
  clearThreadState?(threadId: string): void;
}

interface ChatSessionUpdate {
  state: ChatState;
  immediate?: boolean;
}

type ChatSessionListener = (update: ChatSessionUpdate) => void;

export class ChatSessionOrchestrator {
  private readonly client: ChatAgentClient;
  private state: ChatState;
  private activeSubscription: Subscription | null = null;
  private listeners = new Set<ChatSessionListener>();

  constructor(config: CommerceConfig, client?: ChatAgentClient) {
    this.client = client ?? new CommerceAgentClient(config);
    this.state = {
      messages: [],
      isLoading: false,
      progressSteps: [],
      progressTrace: [],
      error: null,
      threadId: generateId('thread'),
    };
  }

  getState(): ChatState {
    return this.state;
  }

  subscribe(listener: ChatSessionListener): () => void {
    this.listeners.add(listener);
    listener({state: this.state});
    return () => {
      this.listeners.delete(listener);
    };
  }

  sendMessage(content: string): void {
    const trimmed = content.trim();
    if (!trimmed || this.state.isLoading) {
      return;
    }

    this.activeSubscription?.unsubscribe();

    const userMessage: Message = {
      id: generateId('msg-user'),
      role: 'user',
      content: trimmed,
    };

    const assistantMessageId = generateId('msg-assistant');
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };

    const nextMessages = [
      ...this.state.messages,
      userMessage,
      assistantMessage,
    ];
    const historyForAgent = buildInvocationMessages(this.state.messages);
    const {events} = this.client.invoke(
      [...historyForAgent, userMessage],
      this.state.threadId
    );

    this.updateState(
      {
        ...this.state,
        messages: nextMessages,
        isLoading: true,
        progressSteps: [],
        progressTrace: [],
        error: null,
      },
      false
    );

    let hasTextMessageStarted = false;

    this.activeSubscription = events.subscribe({
      next: (event: BaseEvent) => {
        const eventType = String(
          (event as Record<string, unknown>).type ?? ''
        ).toUpperCase();

        if (eventType === 'TEXT_MESSAGE_START') {
          hasTextMessageStarted = true;
        }

        if (eventType === 'RUN_FINISHED') {
          this.updateState(
            {
              ...this.state,
              progressSteps: this.appendProgressStep(
                this.state.progressSteps,
                'Done'
              ),
              progressTrace: this.markAllProgressTraceCompleted(
                this.state.progressTrace
              ),
            },
            true
          );
        }

        const progressStep = extractStreamingProgress(event);
        if (progressStep !== undefined) {
          this.updateState(
            {
              ...this.state,
              progressSteps: this.appendProgressStep(
                this.state.progressSteps,
                progressStep
              ),
            },
            true
          );
        }

        const progressTrace = this.applyProgressTraceEvent(
          this.state.progressTrace,
          event
        );
        if (progressTrace !== this.state.progressTrace) {
          this.updateState(
            {
              ...this.state,
              progressTrace,
            },
            true
          );
        }

        const parsed = parseAgentEvent(event);
        if (parsed.type === 'message' && !hasTextMessageStarted) {
          return;
        }

        if (parsed.type !== 'lifecycle') {
          this.updateState(
            applyParsedEventToChatState(this.state, assistantMessageId, parsed)
          );
        }
      },
      error: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Stream error occurred';
        this.updateState({
          ...this.state,
          error: message,
          isLoading: false,
          progressSteps: this.appendProgressStep(
            this.state.progressSteps,
            'Response failed'
          ),
          progressTrace: this.markAllProgressTraceCompleted(
            this.state.progressTrace
          ),
        });
      },
      complete: () => {
        const hasDoneStep = this.state.progressSteps.includes('Done');

        this.updateState({
          ...this.state,
          isLoading: false,
          progressSteps: hasDoneStep
            ? this.state.progressSteps
            : this.appendProgressStep(
                this.state.progressSteps,
                'Response complete'
              ),
          progressTrace: this.markAllProgressTraceCompleted(
            this.state.progressTrace
          ),
        });
      },
    });
  }

  clearMessages(): void {
    this.activeSubscription?.unsubscribe();
    this.activeSubscription = null;
    const previousThreadId = this.state.threadId;
    this.client.clearThreadState?.(previousThreadId);
    this.updateState({
      ...this.state,
      messages: [],
      error: null,
      isLoading: false,
      progressSteps: [],
      progressTrace: [],
      threadId: generateId('thread'),
    });
  }

  dismissError(): void {
    this.updateState({
      ...this.state,
      error: null,
    });
  }

  dispose(): void {
    this.activeSubscription?.unsubscribe();
    this.activeSubscription = null;
    this.listeners.clear();
  }

  private updateState(state: ChatState, immediate = false): void {
    this.state = state;
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
