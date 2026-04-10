import {HttpAgent} from '@ag-ui/client';
import type {BaseEvent} from '@ag-ui/core';
import {Observable} from 'rxjs';

import type {CommerceConfig} from '../config/env.js';
import {applyJsonPatch} from '../lib/jsonPatch.js';
import type {
  AgentInvocation,
  CoveoDevPayload,
  Message,
  RunAgentInput,
} from '../types/agent.js';

export class CommerceAgentClient {
  private readonly agent?: HttpAgent;
  private readonly headers: Record<string, string>;
  private readonly url: string;
  private readonly config: CommerceConfig;
  private readonly threadState = new Map<string, Record<string, unknown>>();

  constructor(config: CommerceConfig) {
    this.config = config;

    this.headers =
      config.agentMode === 'coveo-dev'
        ? {
            Authorization: `Bearer ${config.accessToken}`,
            'X-Coveo-Feature-Flags-Overrides': JSON.stringify({
              'use-demo-agent-core-runtime': false,
            }),
            'Content-Type': 'application/json',
          }
        : {};

    // In coveo-dev mode the full URL is already in config.agentUrl.
    // In local mode the Vite proxy rewrites /api → :8080, so we append /invocations.
    this.url =
      config.agentMode === 'coveo-dev'
        ? config.agentUrl
        : `${config.agentUrl}/invocations`;

    if (config.agentMode !== 'coveo-dev') {
      this.agent = new HttpAgent({url: this.url, headers: this.headers});
    }
  }

  invoke(messages: Message[], threadId: string): AgentInvocation {
    const runId = this.generateRunId();

    if (this.config.agentMode === 'coveo-dev') {
      const payload: CoveoDevPayload = {
        trackingId: this.config.trackingId,
        language: this.config.language,
        country: this.config.country,
        currency: this.config.currency,
        clientId: this.config.clientId,
        message:
          messages.length > 0 ? messages[messages.length - 1].content : '',
        context: {
          user: {
            userAgent: '',
          },
          view: {
            url: this.config.contextUrl,
            referrer: this.config.contextUrl,
          },
          cart: [],
        },
        conversationSessionId: threadId,
        targetEngine: 'AGENT_CORE',
      };

      return {
        runId,
        events: this.runCoveoDevStream(payload),
      };
    }

    const payload: RunAgentInput = {
      messages,
      threadId,
      runId,
      state: this.threadState.get(threadId) ?? {},
      tools: [],
      context: [],
      forwardedProps: {
        coveo: {
          accessToken: this.config.accessToken,
          organizationId: this.config.orgId,
          platformUrl: this.config.platformUrl,
          trackingId: this.config.trackingId,
          clientId: this.config.clientId,
          locale: `${this.config.language}-${this.config.country}`,
          currency: this.config.currency,
          timezone: this.config.timezone,
          context: {
            view: {
              url: this.config.contextUrl,
            },
          },
        },
      },
    };

    return {
      runId,
      events: this.captureThreadState(
        this.agent!.run(payload as never) as Observable<BaseEvent>,
        threadId
      ),
    };
  }

  clearThreadState(threadId: string): void {
    this.threadState.delete(threadId);
  }

  private captureThreadState(
    events: Observable<BaseEvent>,
    threadId: string
  ): Observable<BaseEvent> {
    return new Observable<BaseEvent>((subscriber) => {
      const subscription = events.subscribe({
        next: (event) => {
          const typedEvent = event as Record<string, unknown>;
          const eventType = String(typedEvent.type ?? '').toUpperCase();

          if (eventType === 'STATE_SNAPSHOT') {
            const snapshot = typedEvent.snapshot;
            if (snapshot && typeof snapshot === 'object') {
              this.threadState.set(
                threadId,
                snapshot as Record<string, unknown>
              );
            }
          }

          if (eventType === 'STATE_DELTA' && Array.isArray(typedEvent.delta)) {
            const previousState = this.threadState.get(threadId) ?? {};
            const nextState = applyJsonPatch(
              previousState,
              typedEvent.delta as unknown[]
            );
            this.threadState.set(threadId, nextState);
          }

          subscriber.next(event);
        },
        error: (error) => {
          subscriber.error(error);
        },
        complete: () => {
          subscriber.complete();
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  private runCoveoDevStream(payload: CoveoDevPayload): Observable<BaseEvent> {
    return new Observable<BaseEvent>((subscriber) => {
      const abortController = new AbortController();

      const processFrame = (frame: string) => {
        const dataLines = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart());

        if (dataLines.length === 0) {
          return;
        }

        const data = dataLines.join('\n').trim();
        if (!data || data === '[DONE]') {
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(data);
        } catch {
          return;
        }

        const normalized = normalizeEvent(parsed);
        if (normalized) {
          subscriber.next(normalized);
        }
      };

      void (async () => {
        try {
          const response = await fetch(this.url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(payload),
            signal: abortController.signal,
          });

          if (!response.ok) {
            const text = await response.text();
            throw new Error(
              `HTTP ${response.status}: ${text || response.statusText}`
            );
          }

          if (!response.body) {
            throw new Error('Missing response body for coveo-dev stream');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const {done, value} = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, {stream: true});
            const frames = buffer.split(/\r?\n\r?\n/);
            buffer = frames.pop() ?? '';

            for (const frame of frames) {
              processFrame(frame);
            }
          }

          if (buffer.trim()) {
            processFrame(buffer);
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(
            error instanceof Error
              ? error
              : new Error('coveo-dev stream failed')
          );
        }
      })();

      return () => {
        abortController.abort();
      };
    });
  }

  private generateRunId(): string {
    return `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

const KNOWN_EVENT_TYPES = new Set([
  'TEXT_MESSAGE_START',
  'TEXT_MESSAGE_CONTENT',
  'TEXT_MESSAGE_END',
  'TEXT_MESSAGE_CHUNK',
  'THINKING_START',
  'THINKING_END',
  'THINKING_TEXT_MESSAGE_START',
  'THINKING_TEXT_MESSAGE_CONTENT',
  'THINKING_TEXT_MESSAGE_END',
  'TOOL_CALL_START',
  'TOOL_CALL_ARGS',
  'TOOL_CALL_END',
  'TOOL_CALL_CHUNK',
  'TOOL_CALL_RESULT',
  'STATE_SNAPSHOT',
  'STATE_DELTA',
  'MESSAGES_SNAPSHOT',
  'ACTIVITY_SNAPSHOT',
  'ACTIVITY_DELTA',
  'RAW',
  'CUSTOM',
  'RUN_STARTED',
  'RUN_FINISHED',
  'RUN_ERROR',
  'STEP_STARTED',
  'STEP_FINISHED',
  'REASONING_START',
  'REASONING_MESSAGE_START',
  'REASONING_MESSAGE_CONTENT',
  'REASONING_MESSAGE_END',
  'REASONING_MESSAGE_CHUNK',
  'REASONING_END',
  'REASONING_ENCRYPTED_VALUE',
]);

function normalizeEvent(event: unknown): BaseEvent | undefined {
  if (!event || typeof event !== 'object') {
    return undefined;
  }

  const typedEvent = event as Record<string, unknown>;
  const rawType = typedEvent.type;
  if (typeof rawType !== 'string' || rawType.length === 0) {
    return undefined;
  }

  const canonicalType = toKnownEventType(rawType, typedEvent);
  return {
    ...typedEvent,
    type: canonicalType,
  } as BaseEvent;
}

function toKnownEventType(
  eventType: string,
  payload: Record<string, unknown>
): string {
  const normalized = eventType.toUpperCase();
  if (KNOWN_EVENT_TYPES.has(normalized)) {
    return normalized;
  }

  if (normalized === 'TEXT_MESSAGE_') {
    if (
      typeof payload.delta === 'string' ||
      typeof payload.content === 'string' ||
      typeof payload.text === 'string' ||
      typeof payload.data === 'string'
    ) {
      return 'TEXT_MESSAGE_CONTENT';
    }

    if (typeof payload.messageId === 'string') {
      return 'TEXT_MESSAGE_CHUNK';
    }
  }

  return eventType;
}
