import type {BaseEvent} from '@ag-ui/core';
import type {Observable, Subscription} from 'rxjs';

import type {CommerceConfig} from '../config/env.js';
import type {AgentInvocation, ChatState, Message} from '../types/agent.js';

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
      progressLabel: null,
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
        progressLabel: null,
        error: null,
      },
      false
    );

    this.activeSubscription = events.subscribe({
      next: (event: BaseEvent) => {
        const progressUpdate = extractStreamingProgress(event);
        if (progressUpdate !== undefined) {
          this.updateState(
            {
              ...this.state,
              progressLabel: progressUpdate,
            },
            typeof progressUpdate === 'string'
          );
        }

        const parsed = parseAgentEvent(event);
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
          progressLabel: null,
        });
      },
      complete: () => {
        this.updateState({
          ...this.state,
          isLoading: false,
          progressLabel: null,
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
      progressLabel: null,
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
}
