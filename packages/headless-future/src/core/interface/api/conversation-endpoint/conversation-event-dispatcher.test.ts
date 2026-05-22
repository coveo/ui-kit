import {describe, expect, it} from 'vitest';
import {dispatchConversationEvent} from './conversation-event-dispatcher.js';

describe('dispatchConversationEvent', () => {
  const baseOptions = {
    turnId: 'turn-1',
    finalizedAt: 123,
  };

  it('returns stream chunk mutations for TEXT_MESSAGE_CONTENT', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm-1',
        delta: 'hello',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.mutations).toEqual([
      {
        type: 'conversation/appendAgentChunk',
        payload: {
          turnId: 'turn-1',
          chunk: 'hello',
        },
      },
    ]);
  });

  it('returns no chunk mutation for empty TEXT_MESSAGE_CONTENT deltas', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm-1',
        delta: '',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.mutations).toEqual([]);
  });

  it('updates session on turn_started when session values are present', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'turn_started',
        conversationSessionId: 'session-123',
        conversationToken: 'token-123',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.mutations).toEqual([
      {
        type: 'conversation/setSession',
        payload: {
          conversationSessionId: 'session-123',
          conversationToken: 'token-123',
        },
      },
    ]);
  });

  it('returns successful terminal mutations on turn_complete', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'turn_complete',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(true);
    expect(result.mutations).toEqual([
      {
        type: 'conversation/completeTurn',
        payload: {
          turnId: 'turn-1',
          finalizedAt: 123,
        },
      },
      {
        type: 'conversationEndpoint/setStatus',
        payload: 'idle',
      },
      {
        type: 'conversationEndpoint/setStreamingConnected',
        payload: false,
      },
    ]);
  });

  it('maps RUN_ERROR to protocol_error failure mutations', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'RUN_ERROR',
        message: 'payload mismatch',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(true);
    expect(result.mutations).toEqual([
      {
        type: 'conversation/failTurn',
        payload: {
          turnId: 'turn-1',
          finalizedAt: 123,
          reason: 'protocol_error',
        },
      },
      {
        type: 'conversation/setError',
        payload: 'payload mismatch',
      },
      {
        type: 'conversationEndpoint/setError',
        payload: 'payload mismatch',
      },
      {
        type: 'conversationEndpoint/setStatus',
        payload: 'idle',
      },
      {
        type: 'conversationEndpoint/setStreamingConnected',
        payload: false,
      },
    ]);
  });

  it('records warning for unknown events and keeps stream alive', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'UNKNOWN',
        event: 'tool_mystery',
        payload: {foo: 'bar'},
      },
    });

    expect(result.isMeaningfulEvent).toBe(false);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.mutations).toEqual([
      {
        type: 'conversationEndpoint/setError',
        payload:
          'Conversation stream warning: unsupported event "tool_mystery".',
      },
    ]);
  });

  it('records warning for custom events and keeps stream alive', () => {
    const result = dispatchConversationEvent({
      ...baseOptions,
      event: {
        type: 'CUSTOM',
        name: 'diagnostic',
        value: {x: 1},
      },
    });

    expect(result.isMeaningfulEvent).toBe(false);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.mutations).toEqual([
      {
        type: 'conversationEndpoint/setError',
        payload:
          'Conversation stream warning: custom event "diagnostic" was ignored.',
      },
    ]);
  });
});
