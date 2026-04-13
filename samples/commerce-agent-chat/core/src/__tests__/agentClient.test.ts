import {lastValueFrom, toArray} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {CommerceConfig} from '../config/env.js';
import {CommerceAgentClient} from '../lib/agentClient.js';

describe('CommerceAgentClient', () => {
  const mockConfig: CommerceConfig = {
    agentMode: 'local',
    agentUrl: 'http://localhost:8080',
    orgId: 'test-org',
    accessToken: 'test-token',
    platformUrl: 'https://platform.cloud.coveo.com',
    trackingId: 'test-tracking',
    language: 'en',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Montreal',
    clientId: 'test-client-id',
    contextUrl: 'https://example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('instantiates with config', () => {
    const client = new CommerceAgentClient(mockConfig);
    expect(client).toBeDefined();
  });

  it('builds valid request payloads and invokes local stream endpoint', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"RUN_FINISHED","threadId":"thread-1","runId":"r1"}\n\n'
          )
        );
        controller.close();
      },
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(stream, {status: 200}));

    const client = new CommerceAgentClient(mockConfig);

    const invocation = client.invoke(
      [{id: 'msg-1', role: 'user', content: 'Hello'}],
      'thread-1'
    );

    await lastValueFrom(invocation.events.pipe(toArray()));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    const firstCallArg = JSON.parse(String(firstCall[1]?.body)) as Record<
      string,
      unknown
    >;

    expect(firstCallArg.threadId).toBe('thread-1');
    expect(firstCallArg.messages).toEqual([
      {id: 'msg-1', role: 'user', content: 'Hello'},
    ]);
    expect(firstCallArg.forwardedProps).toBeDefined();
    expect(
      (firstCallArg.forwardedProps as Record<string, unknown>).policy
    ).toBeUndefined();

    fetchMock.mockRestore();
  });

  it('reuses local thread state between invocations', async () => {
    const encoder = new TextEncoder();
    const stream1 = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"STATE_SNAPSHOT","snapshot":{"conversation":{"lastIntent":"search"}}}\n\n'
          )
        );
        controller.enqueue(
          encoder.encode(
            'data: {"type":"RUN_FINISHED","threadId":"thread-state","runId":"r1"}\n\n'
          )
        );
        controller.close();
      },
    });
    const stream2 = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"RUN_FINISHED","threadId":"thread-state","runId":"r2"}\n\n'
          )
        );
        controller.close();
      },
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(stream1, {status: 200}))
      .mockResolvedValueOnce(new Response(stream2, {status: 200}));

    const client = new CommerceAgentClient(mockConfig);

    const first = client.invoke(
      [{id: 'msg-1', role: 'user', content: 'Find shoes'}],
      'thread-state'
    );
    await lastValueFrom(first.events.pipe(toArray()));

    const second = client.invoke(
      [{id: 'msg-2', role: 'user', content: 'Only red ones'}],
      'thread-state'
    );
    await lastValueFrom(second.events.pipe(toArray()));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallArg = JSON.parse(
      String(fetchMock.mock.calls[1][1]?.body)
    ) as Record<string, unknown>;
    expect(secondCallArg.state).toEqual({
      conversation: {lastIntent: 'search'},
    });

    fetchMock.mockRestore();
  });

  it('parses coveo-dev SSE events without HttpAgent schema validation', async () => {
    const coveoConfig: CommerceConfig = {
      ...mockConfig,
      agentMode: 'coveo-dev',
      agentUrl:
        '/api/coveo-dev/rest/organizations/test-org/commerce/unstable/agentic/converse',
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"TEXT_MESSAGE_","messageId":"m1","delta":"Hello"}\n\n'
          )
        );
        controller.enqueue(encoder.encode('data: {"type":"RUN_FINISHED"}\n\n'));
        controller.close();
      },
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(stream, {status: 200}));

    const client = new CommerceAgentClient(coveoConfig);
    const {events} = client.invoke(
      [{id: 'msg-1', role: 'user', content: 'Hello'}],
      'thread-1'
    );

    const emitted = await lastValueFrom(events.pipe(toArray()));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(emitted[0]).toMatchObject({
      type: 'TEXT_MESSAGE_CONTENT',
      delta: 'Hello',
    });
    expect(emitted[1]).toMatchObject({
      type: 'RUN_FINISHED',
    });

    fetchMock.mockRestore();
  });

  it('expands coveo-dev proxy prefix to full converse path', async () => {
    const coveoConfig: CommerceConfig = {
      ...mockConfig,
      agentMode: 'coveo-dev',
      agentUrl: '/api',
      orgId: 'my-org',
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"RUN_FINISHED"}\n\n'));
        controller.close();
      },
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(stream, {status: 200}));

    const client = new CommerceAgentClient(coveoConfig);
    const {events} = client.invoke(
      [{id: 'msg-1', role: 'user', content: 'Hello'}],
      'thread-1'
    );
    await lastValueFrom(events.pipe(toArray()));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/api/coveo-dev/rest/organizations/my-org/commerce/unstable/agentic/converse'
    );

    fetchMock.mockRestore();
  });

  it('drops malformed SSE events that omit type in standard mode', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"RUN_FINISHED","threadId":"thread-1","runId":"r1"}\n\n'
          )
        );
        controller.close();
      },
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(stream, {status: 200}));

    const client = new CommerceAgentClient(mockConfig);
    const {events} = client.invoke(
      [{id: 'msg-1', role: 'user', content: 'Hello'}],
      'thread-1'
    );

    const emitted = await lastValueFrom(events.pipe(toArray()));

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({type: 'RUN_FINISHED'});

    fetchMock.mockRestore();
  });
});
