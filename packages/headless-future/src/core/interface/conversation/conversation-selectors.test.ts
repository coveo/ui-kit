import {describe, expect, it} from 'vitest';
import type {ConversationState} from './conversation-types.js';
import {createConversationSelectors} from './conversation-selectors.js';

const TEST_ID = 'test';
const selectors = createConversationSelectors(TEST_ID);

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

  const initialState = {[`${TEST_ID}/conversation`]: initialConversationState};
  const populatedState = {
    [`${TEST_ID}/conversation`]: populatedConversationState,
  };

  it('should expose the initial conversation state', () => {
    expect(selectors.getMessages(initialState)).toEqual([]);
    expect(selectors.getTurns(initialState)).toEqual([]);
    expect(selectors.getActiveTurnId(initialState)).toBeNull();
    expect(selectors.getActiveTurnUserMessage(initialState)).toBeUndefined();
    expect(selectors.getSession(initialState)).toEqual({});
    expect(selectors.getIsLoading(initialState)).toBe(false);
    expect(selectors.getError(initialState)).toBeNull();
    expect(selectors.getStreaming(initialState)).toEqual({isConnected: false});
  });

  it('should expose a populated conversation state', () => {
    expect(selectors.getMessages(populatedState)).toHaveLength(2);
    expect(selectors.getTurns(populatedState)).toHaveLength(1);
    expect(selectors.getActiveTurnId(populatedState)).toBe('turn-1');
    expect(selectors.getActiveTurnUserMessage(populatedState)).toBe('Hello');
    expect(selectors.getSession(populatedState)).toEqual({
      conversationSessionId: 'session-1',
      conversationToken: 'token-1',
    });
    expect(selectors.getIsLoading(populatedState)).toBe(true);
    expect(selectors.getError(populatedState)).toBeNull();
    expect(selectors.getStreaming(populatedState)).toEqual({isConnected: true});
  });

  it('should return undefined when the active turn has no user message', () => {
    const stateWithoutUserMessage = {
      [`${TEST_ID}/conversation`]: {
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
      selectors.getActiveTurnUserMessage(stateWithoutUserMessage)
    ).toBeUndefined();
  });
});
