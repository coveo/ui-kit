import {HttpAgent} from '@ag-ui/client';
import type {
  BaseEvent,
  RunAgentInput as AgUiRunAgentInput,
} from '@ag-ui/client';
import {Observable} from 'rxjs';

import type {CommerceConfig} from '../config/env.js';
import type {
  AgentInvocation,
  CoveoDevPayload,
  Message,
} from '../types/agent.js';
import {generateId} from './chatIds.js';

export class CommerceAgentClient {
  private readonly headers: Record<string, string>;
  private readonly url: string;
  private readonly config: CommerceConfig;
  private readonly httpAgent: HttpAgent;

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
        : {
            'Content-Type': 'application/json',
          };

    // In local mode the dev proxy rewrites /api → :8080, so we append /invocations.
    // In coveo-dev mode, allow either full converse path or a proxy prefix.
    this.url = resolveAgentUrl(config);
    this.httpAgent = new HttpAgent({url: this.url, headers: this.headers});
  }

  invoke(
    messages: Message[],
    threadId: string,
    threadState: Record<string, unknown> = {}
  ): AgentInvocation {
    const runId = generateId('run');

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
        events: parseCoveoSseStream(this.url, this.headers, payload),
      };
    }

    const input: AgUiRunAgentInput = {
      messages: messages as AgUiRunAgentInput['messages'],
      threadId,
      runId,
      state: threadState,
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
      events: this.httpAgent.run(input),
    };
  }
}

function resolveAgentUrl(config: CommerceConfig): string {
  if (config.agentMode !== 'coveo-dev') {
    return `${config.agentUrl}/invocations`;
  }

  const configured = config.agentUrl.trim();
  if (configured.includes('/rest/organizations/')) {
    return configured;
  }

  if (!config.orgId) {
    return configured;
  }

  const baseProxy = configured.startsWith('/api/coveo-dev')
    ? configured
    : '/api/coveo-dev';

  return `${baseProxy.replace(/\/$/, '')}/rest/organizations/${config.orgId}/commerce/unstable/agentic/converse`;
}

function parseCoveoSseStream(
  url: string,
  headers: Record<string, string>,
  payload: unknown
): Observable<BaseEvent> {
  return new Observable<BaseEvent>((sub) => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${(await response.text()) || response.statusText}`
          );
        }
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const {done, value} = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, {stream: true});
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() ?? '';
          for (const frame of frames) {
            const event = parseSseFrame(frame);
            if (event) sub.next(event);
          }
        }
        if (buffer.trim()) {
          const event = parseSseFrame(buffer);
          if (event) sub.next(event);
        }
        sub.complete();
      } catch (e) {
        sub.error(e instanceof Error ? e : new Error(String(e)));
      }
    })();
    return () => controller.abort();
  });
}

function parseSseFrame(frame: string): BaseEvent | undefined {
  const data = frame
    .split(/\r?\n/)
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trimStart())
    .join('\n')
    .trim();
  if (!data || data === '[DONE]') return undefined;
  try {
    return normalizeCoveoEvent(JSON.parse(data));
  } catch {
    return undefined;
  }
}

function normalizeCoveoEvent(event: unknown): BaseEvent | undefined {
  if (!event || typeof event !== 'object') return undefined;
  const e = event as Record<string, unknown>;
  const rawType = e.type;
  if (typeof rawType !== 'string' || !rawType) {
    if (typeof e.error === 'string' || typeof e.message === 'string') {
      return {...e, type: 'CUSTOM'} as BaseEvent;
    }
    return undefined;
  }
  const upper = rawType.toUpperCase();

  // Normalize non-standard text types and field aliases → TEXT_MESSAGE_CONTENT with delta.
  if (
    upper === 'TEXT_MESSAGE_' ||
    upper === 'TEXT_MESSAGE_CONTENT' ||
    rawType === 'stream'
  ) {
    const delta =
      typeof e.delta === 'string'
        ? e.delta
        : typeof e.content === 'string'
          ? e.content
          : typeof e.text === 'string'
            ? e.text
            : typeof e.data === 'string'
              ? e.data
              : undefined;
    if (delta !== undefined) {
      return {...e, type: 'TEXT_MESSAGE_CONTENT', delta} as BaseEvent;
    }
    if (upper === 'TEXT_MESSAGE_' && typeof e.messageId === 'string') {
      return {...e, type: 'TEXT_MESSAGE_CHUNK'} as BaseEvent;
    }
  }

  // Lift payload.delta for chunk events that nest it.
  if (upper === 'TEXT_MESSAGE_CHUNK' && typeof e.delta !== 'string') {
    const payloadDelta =
      typeof e.payload === 'object' && e.payload !== null
        ? (e.payload as Record<string, unknown>).delta
        : undefined;
    if (typeof payloadDelta === 'string') {
      return {
        ...e,
        type: 'TEXT_MESSAGE_CHUNK',
        delta: payloadDelta,
      } as BaseEvent;
    }
  }

  return {...e, type: upper} as BaseEvent;
}
