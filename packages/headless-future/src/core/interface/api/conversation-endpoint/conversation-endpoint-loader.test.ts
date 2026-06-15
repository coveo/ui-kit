import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateConversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {loadConversationEndpoint} from './conversation-endpoint-loader.js';

const TEST_ID = 'test';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  getNavigatorContextProvider: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
    getNavigatorContextProvider: vi.fn(),
    read: vi.fn(),
  } as unknown as MockEngine;
};

describe('loadConversationEndpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts only conversation endpoint slice and registers providers once', () => {
    const engine = createMockEngine();

    loadConversationEndpoint(engine, TEST_ID);
    loadConversationEndpoint(engine, TEST_ID);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(
      getOrCreateConversationEndpointSlice(TEST_ID)
    );

    const registry = getEndpointContributorRegistry(engine);
    expect(
      registry.getRegisteredContributorCount(conversationEndpointKey)
    ).toBe(3);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadConversationEndpoint(firstEngine, TEST_ID);
    loadConversationEndpoint(secondEngine, TEST_ID);

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(
      getEndpointContributorRegistry(firstEngine).getRegisteredContributorCount(
        conversationEndpointKey
      )
    ).toBe(3);
    expect(
      getEndpointContributorRegistry(
        secondEngine
      ).getRegisteredContributorCount(conversationEndpointKey)
    ).toBe(3);
  });
});
