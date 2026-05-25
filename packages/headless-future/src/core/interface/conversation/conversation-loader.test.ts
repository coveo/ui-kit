import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {loadConversation} from './conversation-loader.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  const state = {
    conversation: {
      messages: [
        {
          id: 'user-message-1',
          role: 'user',
          content: 'hello',
          createdAt: 111,
        },
        {
          id: 'agent-message-1',
          role: 'agent',
          content: '',
          createdAt: 111,
        },
      ],
      turns: [
        {
          id: 'turn-1',
          status: {type: 'pending'},
          messageIds: ['user-message-1', 'agent-message-1'],
          createdAt: 111,
        },
      ],
      activeTurnId: 'turn-1',
      session: {
        conversationSessionId: 'session-1',
      },
      isLoading: true,
      error: null,
      streaming: {isConnected: false},
    },
  };

  return {
    adoptSlice: vi.fn(async () => undefined),
    read: vi.fn((selector) => selector(state)),
  } as unknown as MockEngine;
};

describe('loadConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts conversation slice and registers request contributor once per engine', () => {
    const engine = createMockEngine();

    loadConversation(engine);
    loadConversation(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(conversationSlice);

    const registry = getEndpointContributorRegistry(engine);
    expect(
      registry.getRegisteredContributorCount(conversationEndpointKey)
    ).toBe(1);

    const [contributor] = registry.getOrderedContributors(
      conversationEndpointKey
    );
    expect(contributor()).toEqual({
      message: 'hello',
      conversationSessionId: 'session-1',
    });
  });
});
