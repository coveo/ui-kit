import {describe, expect, it} from 'vitest';

import {
  applyParsedEventToStore,
  applyThreadStateDelta,
  beginChatTurn,
  clearChatSession,
  createChatSessionStore,
  createPendingChatTurn,
  getActivityOwnership,
  markBackendOwnedActivityFromParsedEvent,
  replaceChatState,
  selectChatState,
  setActivityOwner,
  setThreadStateSnapshot,
} from '../lib/chatStore.js';

describe('chatStore', () => {
  it('keeps thread state when chat state is replaced', () => {
    const store = createChatSessionStore('thread-1');

    setThreadStateSnapshot(store, {conversation: {lastIntent: 'search'}});
    replaceChatState(store, {
      messages: [],
      isLoading: true,
      progressSteps: ['Reasoning...'],
      progressTrace: [],
      error: null,
      threadId: 'thread-1',
    });

    expect(store.getState().threadState).toEqual({
      conversation: {lastIntent: 'search'},
    });
  });

  it('applies thread state deltas in the client store', () => {
    const store = createChatSessionStore('thread-1');

    setThreadStateSnapshot(store, {conversation: {lastIntent: 'search'}});
    applyThreadStateDelta(store, [
      {op: 'add', path: '/conversation/filters', value: ['red']},
    ]);

    expect(store.getState().threadState).toEqual({
      conversation: {lastIntent: 'search', filters: ['red']},
    });
  });

  it('resets chat state and thread state together', () => {
    const store = createChatSessionStore('thread-1');

    beginChatTurn(store, createPendingChatTurn('Hello'));
    setThreadStateSnapshot(store, {conversation: {lastIntent: 'search'}});

    clearChatSession(store);

    expect(selectChatState(store).messages).toEqual([]);
    expect(store.getState().threadState).toEqual({});
    expect(selectChatState(store).threadId).not.toBe('thread-1');
  });

  it('tracks ownership metadata for streamed activities', () => {
    const store = createChatSessionStore('thread-1');

    markBackendOwnedActivityFromParsedEvent(store, {
      type: 'activity_snapshot',
      activitySnapshot: {
        messageId: 'act-1',
        activityType: 'a2ui-surface',
        content: {},
      },
    });

    expect(getActivityOwnership(store, 'act-1')).toMatchObject({
      owner: 'backend',
      activityType: 'a2ui-surface',
      threadId: 'thread-1',
    });
  });

  it('supports ownership handoff to client', () => {
    const store = createChatSessionStore('thread-1');

    markBackendOwnedActivityFromParsedEvent(store, {
      type: 'activity_delta',
      activityDelta: {
        messageId: 'act-2',
        activityType: 'a2ui-surface',
        patch: [],
      },
    });
    setActivityOwner(store, 'act-2', 'client');

    expect(getActivityOwnership(store, 'act-2')).toMatchObject({
      owner: 'client',
      activityType: 'a2ui-surface',
      threadId: 'thread-1',
    });
  });

  it('ignores backend deltas for client-owned activities', () => {
    const store = createChatSessionStore('thread-1');

    const turn = createPendingChatTurn('Hello');
    beginChatTurn(store, turn);
    applyParsedEventToStore(store, turn.assistantMessage.id, {
      type: 'activity_snapshot',
      activitySnapshot: {
        messageId: 'act-3',
        activityType: 'a2ui-surface',
        content: {},
      },
    });
    setActivityOwner(store, 'act-3', 'client');

    // Backend delta arrives after handoff; ownership should remain client.
    applyParsedEventToStore(store, turn.assistantMessage.id, {
      type: 'activity_delta',
      activityDelta: {
        messageId: 'act-3',
        activityType: 'a2ui-surface',
        patch: [{op: 'add', path: '/x', value: 1}],
      },
    });

    expect(getActivityOwnership(store, 'act-3')?.owner).toBe('client');
  });
});
