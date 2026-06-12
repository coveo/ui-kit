import {describe, expect, it} from 'vitest';
import type {ConversationState} from './conversation-types.js';
import {
  activeTurnId,
  activeTurnUserMessage,
  error,
  isLoading,
  messages,
  session,
  streaming,
  turns,
} from './conversation-selectors.js';

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
    expect(messages(initialState)).toEqual([]);
    expect(turns(initialState)).toEqual([]);
    expect(activeTurnId(initialState)).toBeNull();
    expect(activeTurnUserMessage(initialState)).toBeUndefined();
    expect(session(initialState)).toEqual({});
    expect(isLoading(initialState)).toBe(false);
    expect(error(initialState)).toBeNull();
    expect(streaming(initialState)).toEqual({isConnected: false});
  });

  it('should expose a populated conversation state', () => {
    expect(messages(populatedState)).toHaveLength(2);
    expect(turns(populatedState)).toHaveLength(1);
    expect(activeTurnId(populatedState)).toBe('turn-1');
    expect(activeTurnUserMessage(populatedState)).toBe('Hello');
    expect(session(populatedState)).toEqual({
      conversationSessionId: 'session-1',
      conversationToken: 'token-1',
    });
    expect(isLoading(populatedState)).toBe(true);
    expect(error(populatedState)).toBeNull();
    expect(streaming(populatedState)).toEqual({isConnected: true});
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

    expect(activeTurnUserMessage(stateWithoutUserMessage)).toBeUndefined();
  });
});
