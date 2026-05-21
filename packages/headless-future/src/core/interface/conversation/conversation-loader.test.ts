import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';
import {loadConversation} from './conversation-loader.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
    read: vi.fn(() => ({conversationSessionId: 'session-1'})),
  } as unknown as MockEngine;
};

describe('loadConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts conversation slice and registers session provider once per engine', () => {
    const engine = createMockEngine();

    loadConversation(engine);
    loadConversation(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(conversationSlice);

    const registry = getEndpointContributorRegistry(engine);
    expect(
      registry.getRegisteredContributorCount(conversationEndpointKey)
    ).toBe(1);
  });
});
