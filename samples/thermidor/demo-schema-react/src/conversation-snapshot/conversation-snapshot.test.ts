import {describe, expect, it} from 'vitest';
import type {SerializedSession} from '@coveo/thermidor';
import {conversationSnapshot, sessionToReopen} from './conversation-snapshot.js';

const serialized: SerializedSession = {
  version: 2,
  sessionId: 'session-1',
  sessionToken: 'secret-token',
  activeTurnId: 'turn-2',
  turns: [
    {
      id: 'turn-1',
      input: {prompt: 'What is Coveo?'},
      status: 'complete',
      response: {activities: []},
    },
    {
      id: 'turn-2',
      input: {prompt: 'And Thermidor?'},
      status: 'complete',
      response: {activities: []},
    },
  ],
};

describe('conversationSnapshot', () => {
  it('wraps the session, without its token, titled by its first question', () => {
    expect(conversationSnapshot(serialized, 'conversation-1')).toEqual({
      format: 'thermidor-session',
      version: 2,
      conversation_id: 'conversation-1',
      title: 'What is Coveo?',
      content: {
        version: 2,
        sessionId: 'session-1',
        activeTurnId: 'turn-2',
        turns: serialized.turns,
      },
    });
  });
});

describe('sessionToReopen', () => {
  it('gives back the session a snapshot keeps', () => {
    const snapshot = conversationSnapshot(serialized, 'conversation-1');
    const stored = {...snapshot, saved_at: '2026-10-27T12:00:00Z'};

    expect(sessionToReopen(stored)).toEqual(snapshot.content);
  });

  it('refuses a snapshot of another format', () => {
    expect(() =>
      sessionToReopen({format: 'other-chat', version: 1, conversation_id: 'c', content: {}})
    ).toThrow('"other-chat" is not a Thermidor session');
  });

  it("refuses a snapshot whose version differs from its session's", () => {
    const snapshot = conversationSnapshot(serialized, 'conversation-1');

    expect(() => sessionToReopen({...snapshot, version: 3})).toThrow(
      "version 3 does not match its session's version 2"
    );
  });
});
