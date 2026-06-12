import {describe, expect, it} from 'vitest';
import {dispatchConversationEvent} from './conversation-event-dispatcher.js';

describe('dispatchConversationEvent', () => {
  it('returns stream chunk effects for TEXT_MESSAGE_CONTENT', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm-1',
        delta: 'hello',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([
      {
        type: 'append_agent_chunk',
        chunk: 'hello',
      },
    ]);
  });

  it('returns no chunk effects for empty TEXT_MESSAGE_CONTENT deltas', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm-1',
        delta: '',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([]);
  });

  it('returns a patch_session effect on turn_started when session values are present', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'turn_started',
        conversationSessionId: 'session-123',
        conversationToken: 'token-123',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([
      {
        type: 'patch_session',
        sessionPatch: {
          conversationSessionId: 'session-123',
          conversationToken: 'token-123',
        },
      },
    ]);
  });

  it('returns a patch_session effect with conversationSessionId on RUN_STARTED', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'RUN_STARTED',
        runId: 'run-1',
        threadId: 'thread-123',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([
      {
        type: 'patch_session',
        sessionPatch: {
          conversationSessionId: 'thread-123',
        },
      },
    ]);
  });

  it('returns a patch_session effect from CUSTOM header events', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'CUSTOM',
        name: 'header',
        value: {
          conversationToken: 'token-abc',
        },
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([
      {
        type: 'patch_session',
        sessionPatch: {
          conversationToken: 'token-abc',
        },
      },
    ]);
  });

  it('returns a terminal complete_turn effect on turn_complete', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'turn_complete',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(true);
    expect(result.effects).toEqual([
      {
        type: 'complete_turn',
      },
    ]);
  });

  it('returns patch_session and complete_turn effects on turn_complete when session fields are present', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'turn_complete',
        conversationSessionId: 'session-456',
        conversationToken: 'token-456',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(true);
    expect(result.effects).toEqual([
      {
        type: 'patch_session',
        sessionPatch: {
          conversationSessionId: 'session-456',
          conversationToken: 'token-456',
        },
      },
      {
        type: 'complete_turn',
      },
    ]);
  });

  it('ignores STATE_SNAPSHOT events without warnings', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'STATE_SNAPSHOT',
        snapshot: {
          foo: 'bar',
        },
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([]);
  });

  it('ignores ACTIVITY_SNAPSHOT events without warnings', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'ACTIVITY_SNAPSHOT',
        timestamp: 1715638000000,
        messageId: 'activity-message-1',
        activityType: 'a2ui-surface',
        content: {
          operations: [
            {
              beginRendering: {
                surfaceId: 'surface-1',
                root: 'root',
                catalogId: 'catalog-1',
              },
            },
          ],
        },
        replace: true,
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([]);
  });

  it('maps RUN_ERROR to a protocol_error fail_turn effect', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'RUN_ERROR',
        message: 'payload mismatch',
      },
    });

    expect(result.isMeaningfulEvent).toBe(true);
    expect(result.isTerminalEvent).toBe(true);
    expect(result.effects).toEqual([
      {
        type: 'fail_turn',
        reason: 'protocol_error',
        error: 'payload mismatch',
      },
    ]);
  });

  it('returns endpoint warning effect for unknown events and keeps stream alive', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'UNKNOWN',
        event: 'tool_mystery',
        payload: {foo: 'bar'},
      },
    });

    expect(result.isMeaningfulEvent).toBe(false);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([
      {
        type: 'set_endpoint_error',
        error: 'Conversation stream warning: unsupported event "tool_mystery".',
      },
    ]);
  });

  it('returns endpoint warning effect for ignored custom events and keeps stream alive', () => {
    const result = dispatchConversationEvent({
      event: {
        type: 'CUSTOM',
        name: 'diagnostic',
        value: {x: 1},
      },
    });

    expect(result.isMeaningfulEvent).toBe(false);
    expect(result.isTerminalEvent).toBe(false);
    expect(result.effects).toEqual([
      {
        type: 'set_endpoint_error',
        error:
          'Conversation stream warning: custom event "diagnostic" was ignored.',
      },
    ]);
  });
});
