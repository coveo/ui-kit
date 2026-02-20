/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {AgentSubscriber} from './agent-subscriber.js';
import {EventType} from './event-types.js';
import {HttpAgent} from './http-agent.js';

/**
 * Creates a mock Response whose body is an SSE stream built from `events`.
 */
function mockSSEResponse(events: object[]): Response {
  const sseText = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(sseText));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: {'Content-Type': 'text/event-stream'},
  });
}

describe('HttpAgent', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should send a POST request to the configured URL', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse([]));

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.com/agent',
      expect.objectContaining({method: 'POST'})
    );
  });

  it('should dispatch onRunStartedEvent to the subscriber', async () => {
    const events = [{type: EventType.RUN_STARTED, runId: 'r1', threadId: 't1'}];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onRunStartedEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onRunStartedEvent).toHaveBeenCalledWith({
      event: {type: EventType.RUN_STARTED, runId: 'r1', threadId: 't1'},
    });
  });

  it('should dispatch onTextMessageStartEvent to the subscriber', async () => {
    const events = [{type: EventType.TEXT_MESSAGE_START, messageId: 'm1'}];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onTextMessageStartEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onTextMessageStartEvent).toHaveBeenCalledWith({
      event: {type: EventType.TEXT_MESSAGE_START, messageId: 'm1'},
    });
  });

  it('should dispatch onTextMessageContentEvent to the subscriber', async () => {
    const events = [
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: 'Hello'},
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onTextMessageContentEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onTextMessageContentEvent).toHaveBeenCalledWith({
      event: {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId: 'm1',
        delta: 'Hello',
      },
    });
  });

  it('should dispatch onCustomEvent to the subscriber', async () => {
    const events = [
      {type: EventType.CUSTOM, name: 'header', value: {conversationId: 'c1'}},
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onCustomEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onCustomEvent).toHaveBeenCalledWith({
      event: {
        type: EventType.CUSTOM,
        name: 'header',
        value: {conversationId: 'c1'},
      },
    });
  });

  it('should dispatch onRunErrorEvent to the subscriber', async () => {
    const events = [
      {type: EventType.RUN_ERROR, message: 'Something went wrong', code: '500'},
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onRunErrorEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onRunErrorEvent).toHaveBeenCalledWith({
      event: {
        type: EventType.RUN_ERROR,
        message: 'Something went wrong',
        code: '500',
      },
    });
  });

  it('should dispatch onRunFinishedEvent to the subscriber', async () => {
    const events = [
      {
        type: EventType.RUN_FINISHED,
        runId: 'r1',
        threadId: 't1',
        result: {answerGenerated: true},
      },
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onRunFinishedEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onRunFinishedEvent).toHaveBeenCalledWith({
      event: {
        type: EventType.RUN_FINISHED,
        runId: 'r1',
        threadId: 't1',
        result: {answerGenerated: true},
      },
    });
  });

  it('should dispatch a full event sequence to the subscriber', async () => {
    const events = [
      {type: EventType.RUN_STARTED, runId: 'r1', threadId: 't1'},
      {type: EventType.TEXT_MESSAGE_START, messageId: 'm1'},
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: 'Hello'},
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: ' world'},
      {type: EventType.CUSTOM, name: 'citations', value: {citations: []}},
      {
        type: EventType.RUN_FINISHED,
        runId: 'r1',
        threadId: 't1',
        result: {answerGenerated: true},
      },
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onRunStartedEvent: vi.fn(),
      onTextMessageStartEvent: vi.fn(),
      onTextMessageContentEvent: vi.fn(),
      onCustomEvent: vi.fn(),
      onRunFinishedEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onRunStartedEvent).toHaveBeenCalledTimes(1);
    expect(subscriber.onTextMessageStartEvent).toHaveBeenCalledTimes(1);
    expect(subscriber.onTextMessageContentEvent).toHaveBeenCalledTimes(2);
    expect(subscriber.onCustomEvent).toHaveBeenCalledTimes(1);
    expect(subscriber.onRunFinishedEvent).toHaveBeenCalledTimes(1);
  });

  it('should throw on non-OK HTTP responses', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('Unauthorized', {status: 401})
    );

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await expect(agent.runAgent()).rejects.toThrow('HTTP 401');
  });

  it('should allow subclasses to override requestInit', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse([]));

    class CustomAgent extends HttpAgent {
      protected requestInit() {
        return {
          method: 'POST',
          headers: {
            Authorization: 'Bearer token-123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({custom: true}),
        };
      }
    }

    const agent = new CustomAgent({url: 'https://example.com/agent'});
    await agent.runAgent();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.com/agent',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
        body: JSON.stringify({custom: true}),
      })
    );
  });

  it('should forward forwardedProps to the agent input', async () => {
    let capturedInit: RequestInit | undefined;
    vi.mocked(globalThis.fetch).mockImplementation(
      async (_url: string | URL | Request, init?: RequestInit) => {
        capturedInit = init;
        return mockSSEResponse([]);
      }
    );

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({forwardedProps: {accessToken: 'abc'}});

    const body = JSON.parse(capturedInit?.body as string);
    expect(body.forwardedProps).toEqual({accessToken: 'abc'});
  });

  it('should abort the fetch when abortRun is called', () => {
    const agent = new HttpAgent({url: 'https://example.com/agent'});
    expect(agent.abortController.signal.aborted).toBe(false);
    agent.abortRun();
    expect(agent.abortController.signal.aborted).toBe(true);
  });

  it('should skip unknown event types without errors', async () => {
    const events = [
      {type: 'UNKNOWN_EVENT', data: 'test'},
      {type: EventType.RUN_FINISHED, runId: 'r1', threadId: 't1'},
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockSSEResponse(events));

    const subscriber: AgentSubscriber = {
      onRunFinishedEvent: vi.fn(),
    };

    const agent = new HttpAgent({url: 'https://example.com/agent'});
    await agent.runAgent({}, subscriber);

    expect(subscriber.onRunFinishedEvent).toHaveBeenCalledTimes(1);
  });
});
