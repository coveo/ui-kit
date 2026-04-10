import {describe, expect, it} from 'vitest';

import {applyParsedEventToChatState} from '../lib/chatEngine.js';
import type {ChatState} from '../types/agent.js';

function makeState(): ChatState {
  return {
    messages: [
      {id: 'u1', role: 'user', content: 'hello'},
      {id: 'a1', role: 'assistant', content: ''},
    ],
    isLoading: true,
    progressLabel: null,
    error: null,
    threadId: 'thread-1',
  };
}

describe('applyParsedEventToChatState', () => {
  it('appends assistant message content', () => {
    const next = applyParsedEventToChatState(makeState(), 'a1', {
      type: 'message',
      content: 'Hi there',
    });

    expect(next.messages[1].content).toBe('Hi there');
  });

  it('adds activity snapshot to assistant message', () => {
    const next = applyParsedEventToChatState(makeState(), 'a1', {
      type: 'activity_snapshot',
      activitySnapshot: {
        messageId: 'act-1',
        activityType: 'a2ui-surface',
        content: {title: 'Products'},
      },
    });

    expect(next.messages[1].activities).toEqual([
      {
        id: 'act-1',
        activityType: 'a2ui-surface',
        content: {title: 'Products'},
      },
    ]);
  });

  it('applies activity delta patch', () => {
    const state = makeState();
    state.messages[1].activities = [
      {
        id: 'act-1',
        activityType: 'a2ui-surface',
        content: {title: 'Old'},
      },
    ];

    const next = applyParsedEventToChatState(state, 'a1', {
      type: 'activity_delta',
      activityDelta: {
        messageId: 'act-1',
        activityType: 'a2ui-surface',
        patch: [{op: 'replace', path: '/title', value: 'New'}],
      },
    });

    expect(next.messages[1].activities?.[0].content).toEqual({title: 'New'});
  });

  it('sets error on error events', () => {
    const next = applyParsedEventToChatState(makeState(), 'a1', {
      type: 'error',
      error: 'Boom',
    });

    expect(next.error).toBe('Boom');
  });

  it('keeps state unchanged for lifecycle events', () => {
    const state = makeState();
    const next = applyParsedEventToChatState(state, 'a1', {
      type: 'lifecycle',
    });

    expect(next).toBe(state);
  });
});
