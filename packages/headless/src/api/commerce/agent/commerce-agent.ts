import {
  HttpAgent,
  parseSSEStream,
  runHttpRequest,
  type BaseEvent,
  type RunAgentInput,
} from '@ag-ui/client';
import {getOrganizationEndpoint} from '../../platform-client.js';
import type {PlatformEnvironment} from '../../../utils/url-utils.js';

export interface CommerceAgentOptions {
  organizationId?: string;
  environment?: PlatformEnvironment;
  accessToken?: string;
  trackingId?: string;
  language?: string;
  country?: string;
  currency?: string;
  clientId?: string;
  contextUrl?: string;
  timezone?: string;
}

/**
 * Commerce Agent extending HttpAgent from @ag-ui/client.
 * Supports coveo-dev mode: Coveo Commerce Agent API (SSE stream with custom payload).
 */
export class CommerceAgent extends HttpAgent {
  private readonly options: CommerceAgentOptions;
  private conversationSessionId: string;

  constructor(url: string, options: CommerceAgentOptions) {
    const headers: Record<string, string> = options.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
          'Content-Type': 'application/json',
        }
      : {
          'Content-Type': 'application/json',
        };

    super({url, headers});
    this.options = options;
    this.conversationSessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  protected override requestInit(input: RunAgentInput): RequestInit {
    return this.buildCoveoDevRequest(input);
  }

  /**
   * Bypasses @ag-ui/client's `transformHttpEventStream` (which applies strict
   * Zod validation) and instead uses `parseSSEStream` directly with event
   * normalization.
   */
  override run(
    input: RunAgentInput
  ): ReturnType<typeof HttpAgent.prototype.run> {
    const source$ = runHttpRequest(this.url, this.requestInit(input));
    const parsed$ = parseSSEStream(source$);

    // Use the Observable constructor from the parsed stream (avoids direct rxjs import).
    const ObservableCtor = parsed$.constructor as new (
      subscribe: (subscriber: {
        next: (value: unknown) => void;
        error: (err: unknown) => void;
        complete: () => void;
      }) => void
    ) => typeof parsed$;

    return new ObservableCtor((subscriber) => {
      parsed$.subscribe({
        next: (raw: Record<string, unknown>) => {
          const normalized = normalizeCoveoEvent(raw);
          if (normalized) {
            subscriber.next(normalized);
          }
        },
        error: (err: unknown) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    }) as ReturnType<typeof HttpAgent.prototype.run>;
  }

  private buildCoveoDevRequest(input: RunAgentInput): RequestInit {
    const lastUserMsg = [...(input.messages ?? [])]
      .reverse()
      .find((m) => m.role === 'user');

    // Use threadId if provided (from agent state), otherwise use generated session ID
    const sessionId =
      input.threadId || this.threadId || this.conversationSessionId;

    const payload = {
      trackingId: this.options.trackingId,
      language: this.options.language,
      country: this.options.country,
      currency: this.options.currency,
      clientId: this.options.clientId,
      message: String(lastUserMsg?.content ?? ''),
      context: {
        user: {userAgent: ''},
        view: {
          url: this.options.contextUrl ?? '',
          referrer: this.options.contextUrl ?? '',
        },
        cart: [],
      },
      conversationSessionId: sessionId,
      targetEngine: 'AGENT_CORE',
    };

    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer ${this.options.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream, application/json',
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    };
  }
}

export function resolveAgentUrl(
  organizationId: string,
  environment?: PlatformEnvironment
): string {
  const endpoint = getOrganizationEndpoint(
    organizationId,
    environment,
    'admin'
  );
  return `${endpoint}/rest/organizations/${organizationId}/commerce/unstable/agentic/converse`;
}

/**
 * Normalizes a raw Coveo SSE event to a valid AG-UI BaseEvent shape.
 * Handles non-standard type names, missing fields, and Coveo-specific formats.
 */
function normalizeCoveoEvent(raw: Record<string, unknown>): BaseEvent | null {
  const rawType = String(raw.type ?? '').toUpperCase();

  // Skip keep-alive or empty events
  if (!rawType && !raw.error && !raw.message) {
    return null;
  }

  // Normalize text content events: Coveo may send as "stream", "TEXT_MESSAGE_", etc.
  if (
    rawType === 'TEXT_MESSAGE_CONTENT' ||
    rawType === 'TEXT_MESSAGE_' ||
    rawType === 'STREAM'
  ) {
    return {
      ...raw,
      type: 'TEXT_MESSAGE_CONTENT',
      delta: raw.delta ?? raw.content ?? raw.text ?? raw.data ?? '',
    } as unknown as BaseEvent;
  }

  // TEXT_MESSAGE_CHUNK: lift nested payload.delta
  if (rawType === 'TEXT_MESSAGE_CHUNK') {
    const payload = raw.payload as Record<string, unknown> | undefined;
    return {
      ...raw,
      type: 'TEXT_MESSAGE_CHUNK',
      delta: payload?.delta ?? raw.delta ?? '',
    } as unknown as BaseEvent;
  }

  // Events without a type but with error/message → CUSTOM
  if (!rawType) {
    return {
      ...raw,
      type: 'CUSTOM',
      name: 'coveo-raw',
    } as unknown as BaseEvent;
  }

  // Pass through with uppercased type
  return {
    ...raw,
    type: rawType,
  } as unknown as BaseEvent;
}
