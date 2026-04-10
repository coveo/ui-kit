import {lastValueFrom, of, toArray} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {BaseEvent} from '@ag-ui/core';

import type {CommerceConfig} from '../config/env.js';
import {CommerceAgentClient} from '../lib/agentClient.js';

const runMock = vi.fn((payload: unknown) =>
  of({type: 'RUN_FINISHED', payload} as BaseEvent)
);

vi.mock('@ag-ui/client', () => {
  class MockHttpAgent {
    run = runMock;
  }

  return {
    HttpAgent: MockHttpAgent,
  };
});

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

  it('builds valid request payloads and invokes run', () => {
    const client = new CommerceAgentClient(mockConfig);

    client.invoke([{id: 'msg-1', role: 'user', content: 'Hello'}], 'thread-1');

    expect(runMock).toHaveBeenCalledTimes(1);
    const firstCall = runMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    const firstCallArg = firstCall[0] as Record<string, unknown>;

    expect(firstCallArg.threadId).toBe('thread-1');
    expect(firstCallArg.messages).toEqual([
      {id: 'msg-1', role: 'user', content: 'Hello'},
    ]);
    expect(firstCallArg.forwardedProps).toBeDefined();
    expect(
      (firstCallArg.forwardedProps as Record<string, unknown>).policy
    ).toBeUndefined();
  });

  it('reuses local thread state between invocations', async () => {
    runMock
      .mockReturnValueOnce(
        of({
          type: 'STATE_SNAPSHOT',
          snapshot: {conversation: {lastIntent: 'search'}},
        } as BaseEvent)
      )
      .mockReturnValueOnce(of({type: 'RUN_FINISHED'} as BaseEvent));

    const client = new CommerceAgentClient(mockConfig);

    const first = client.invoke(
      [{id: 'msg-1', role: 'user', content: 'Find shoes'}],
      'thread-state'
    );
    await lastValueFrom(first.events.pipe(toArray()));

    client.invoke(
      [{id: 'msg-2', role: 'user', content: 'Only red ones'}],
      'thread-state'
    );

    expect(runMock).toHaveBeenCalledTimes(2);
    const secondCallArg = runMock.mock.calls[1][0] as Record<string, unknown>;
    expect(secondCallArg.state).toEqual({
      conversation: {lastIntent: 'search'},
    });
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

    expect(runMock).toHaveBeenCalledTimes(0);
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
});
