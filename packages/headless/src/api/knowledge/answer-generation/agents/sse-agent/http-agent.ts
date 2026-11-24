import {EventType, type RunAgentInput, type RunErrorEvent} from '@ag-ui/core';
import {nanoid} from '@reduxjs/toolkit';
import {type AgentSubscriber, notifySubscriber} from './agent-subscriber.js';
import {createChunkExpander} from './chunk-expander.js';
import {readEventStream} from './event-stream.js';

export interface HttpAgentConfig {
  url: string;
  headers?: Record<string, string>;
  threadId?: string;
}

export interface RunAgentParameters {
  runId?: string;
  forwardedProps?: RunAgentInput['forwardedProps'];
}

const isAbortError = (error: unknown) => (error as Error | undefined)?.name === 'AbortError';

/**
 * A minimal AG-UI agent that POSTs a run to an HTTP endpoint and streams the
 * server-sent events of the response to a subscriber.
 *
 * It replaces `HttpAgent` from `@ag-ui/client` with the subset headless uses, without the
 * message and state tracking, event verification, or schema validation that client brings in.
 * Protocol types come from `@ag-ui/core`.
 */
export class HttpAgent {
  public url: string;
  public headers: Record<string, string>;
  public threadId: string;
  public isRunning = false;
  public abortController = new AbortController();

  constructor({url, headers, threadId}: HttpAgentConfig) {
    this.url = url;
    this.headers = {...headers};
    this.threadId = threadId ?? nanoid();
  }

  /**
   * Returns the fetch options of the run request. Override this to customize the request.
   *
   * @param input The run input.
   * @returns The fetch options.
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
   * Runs the agent and notifies the subscriber of each event of the response stream.
   *
   * Like `@ag-ui/client`, aborting with `abortRun` resolves the promise. If the response was
   * already streaming, the subscriber first receives a `RUN_ERROR` event with the `abort` code.
   *
   * @param parameters The run parameters.
   * @param subscriber The subscriber to notify.
   * @returns A promise that resolves when the stream ends, and rejects on an HTTP, network or parsing error.
   */
  public async runAgent(parameters: RunAgentParameters = {}, subscriber: AgentSubscriber = {}) {
    const abortController = new AbortController();
    this.abortController = abortController;
    this.isRunning = true;
    const input: RunAgentInput = {
      threadId: this.threadId,
      runId: parameters.runId || nanoid(),
      state: {},
      messages: [],
      tools: [],
      context: [],
      forwardedProps: parameters.forwardedProps ?? {},
    };
    const expandChunks = createChunkExpander();
    let isStreaming = false;

    try {
      const response = await fetch(this.url, this.requestInit(input));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      if (!response.body) {
        throw new Error('The response has no body to stream.');
      }
      isStreaming = true;
      await readEventStream(response.body, (event) => {
        for (const expandedEvent of expandChunks(event)) {
          notifySubscriber(subscriber, {event: expandedEvent, agent: this, input});
        }
      });
    } catch (error) {
      if (!isAbortError(error)) {
        abortController.abort();
        throw error;
      }
      if (isStreaming) {
        const event: RunErrorEvent = {
          type: EventType.RUN_ERROR,
          message: (error as Error).message || 'Request aborted',
          code: 'abort',
          rawEvent: error,
        };
        for (const expandedEvent of expandChunks(event)) {
          notifySubscriber(subscriber, {event: expandedEvent, agent: this, input});
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Aborts the current run.
   */
  public abortRun() {
    this.abortController.abort();
  }
}
