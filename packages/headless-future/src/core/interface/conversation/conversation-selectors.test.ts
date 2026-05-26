import {describe, expect, it} from 'vitest';
import type {ConversationState} from './conversation-types.js';
import * as selectors from './conversation-selectors.js';

describe('conversation selectors', () => {
  const initialConversationState: ConversationState = {
    messages: [],
    turns: [],
    activeTurnId: null,
    session: {},
    isLoading: false,
    error: null,
    streaming: {isConnected: false},
  };

  const populatedConversationState: ConversationState = {
    messages: [
      {
        id: 'msg-user-1',
        role: 'user',
        content: 'Hello',
        createdAt: 100,
      },
      {
        id: 'msg-agent-1',
        role: 'agent',
        content: 'World',
        createdAt: 100,
      },
    ],
    turns: [
      {
        id: 'turn-1',
        messageIds: ['msg-user-1', 'msg-agent-1'],
        status: {type: 'streaming'},
        createdAt: 100,
      },
    ],
    activeTurnId: 'turn-1',
    session: {
      conversationSessionId: 'session-1',
      conversationToken: 'token-1',
    },
    isLoading: true,
    error: null,
    streaming: {isConnected: true},
  };

  const initialState = {conversation: initialConversationState};
  const populatedState = {conversation: populatedConversationState};

  it('should expose the initial conversation state', () => {
    expect(selectors.messages(initialState)).toEqual([]);
    expect(selectors.turns(initialState)).toEqual([]);
    expect(selectors.activeTurnId(initialState)).toBeNull();
    expect(selectors.activeTurnUserMessage(initialState)).toBeUndefined();
    expect(selectors.session(initialState)).toEqual({});
    expect(selectors.isLoading(initialState)).toBe(false);
    expect(selectors.error(initialState)).toBeNull();
    expect(selectors.streaming(initialState)).toEqual({isConnected: false});
  });

  it('should expose a populated conversation state', () => {
    expect(selectors.messages(populatedState)).toHaveLength(2);
    expect(selectors.turns(populatedState)).toHaveLength(1);
    expect(selectors.activeTurnId(populatedState)).toBe('turn-1');
    expect(selectors.activeTurnUserMessage(populatedState)).toBe('Hello');
    expect(selectors.session(populatedState)).toEqual({
      conversationSessionId: 'session-1',
      conversationToken: 'token-1',
    });
    expect(selectors.isLoading(populatedState)).toBe(true);
    expect(selectors.error(populatedState)).toBeNull();
    expect(selectors.streaming(populatedState)).toEqual({isConnected: true});
  });

  it('should return undefined when the active turn has no user message', () => {
    const stateWithoutUserMessage = {
      conversation: {
        ...populatedConversationState,
        messages: [
          {
            id: 'msg-agent-1',
            role: 'agent' as const,
            content: 'World',
            createdAt: 100,
          },
        ],
      },
    };

    expect(
      selectors.activeTurnUserMessage(stateWithoutUserMessage)
    ).toBeUndefined();
  });
});
