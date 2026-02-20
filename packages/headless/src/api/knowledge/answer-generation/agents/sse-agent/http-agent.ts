/**
 * A minimal HTTP-based SSE agent that replaces `@ag-ui/client`'s `HttpAgent`.
 *
 * It performs a fetch request, reads the SSE stream, and dispatches
 * parsed events to an {@link AgentSubscriber}.
 */

import type {AgentSubscriber, RunAgentInput} from './agent-subscriber.js';
import {type BaseEvent, EventType} from './event-types.js';
import {parseSSEStream} from './sse-parser.js';

export interface HttpAgentConfig {
  url: string;
  headers?: Record<string, string>;
}

/**
 * Base HTTP agent that streams SSE events from a remote endpoint.
 *
 * Subclasses override {@link requestInit} to customise the fetch
 * request (headers, body, auth, etc.).
 */
export class HttpAgent {
  public url: string;
  public headers: Record<string, string>;
  public abortController: AbortController = new AbortController();

  constructor(config: HttpAgentConfig) {
    this.url = config.url;
    this.headers = {...(config.headers ?? {})};
  }

  /**
   * Returns the `RequestInit` for the fetch call.
   * Override in subclasses to customise the request.
   */
  protected requestInit(input: RunAgentInput): RequestInit {
    return {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(input),
      signal: this.abortController.signal,
    };
  }

  /**
   * Executes the agent: sends the HTTP request, parses the SSE
   * stream, and invokes the matching subscriber callbacks.
   */
  async runAgent(
    parameters?: Partial<RunAgentInput>,
    subscriber?: AgentSubscriber
  ): Promise<void> {
    this.abortController = new AbortController();

    const input: RunAgentInput = {
      forwardedProps: {...(parameters?.forwardedProps ?? {})},
    };

    const response = await fetch(this.url, this.requestInit(input));

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to getReader() from response');
    }

    for await (const event of parseSSEStream(reader)) {
      this.dispatchEvent(event as BaseEvent, subscriber);
    }
  }

  /**
   * Aborts the currently running fetch request.
   */
  abortRun(): void {
    this.abortController.abort();
  }

  /**
   * Routes a parsed SSE event to the appropriate subscriber callback.
   */
  private dispatchEvent(event: BaseEvent, subscriber?: AgentSubscriber): void {
    if (!subscriber) return;

    switch (event.type) {
      case EventType.RUN_STARTED:
        subscriber.onRunStartedEvent?.({event: event as never});
        break;
      case EventType.TEXT_MESSAGE_START:
        subscriber.onTextMessageStartEvent?.({event: event as never});
        break;
      case EventType.TEXT_MESSAGE_CONTENT:
        subscriber.onTextMessageContentEvent?.({event: event as never});
        break;
      case EventType.CUSTOM:
        subscriber.onCustomEvent?.({event: event as never});
        break;
      case EventType.RUN_ERROR:
        subscriber.onRunErrorEvent?.({event: event as never});
        break;
      case EventType.RUN_FINISHED:
        subscriber.onRunFinishedEvent?.({event: event as never});
        break;
    }
  }
}
