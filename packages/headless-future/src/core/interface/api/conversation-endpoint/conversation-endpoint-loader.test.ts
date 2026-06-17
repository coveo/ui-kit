import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateConversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {loadConversationEndpoint} from './conversation-endpoint-loader.js';

const TEST_ID = 'test';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
  } as unknown as MockEngine;
};

describe('loadConversationEndpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts conversation endpoint slice once per interface id', () => {
    const engine = createMockEngine();

    loadConversationEndpoint(engine, TEST_ID);
    loadConversationEndpoint(engine, TEST_ID);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(
      getOrCreateConversationEndpointSlice(TEST_ID)
    );
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadConversationEndpoint(firstEngine, TEST_ID);
    loadConversationEndpoint(secondEngine, TEST_ID);

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
  });
});
