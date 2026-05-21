import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {loadCart} from './cart-loader.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
    read: vi.fn(() => []),
  } as unknown as MockEngine;
};

describe('loadCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts cart slice and registers cart provider once per engine', () => {
    const engine = createMockEngine();

    loadCart(engine);
    loadCart(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(cartSlice);

    const registry = getEndpointContributorRegistry(engine);
    expect(
      registry.getRegisteredContributorCount(conversationEndpointKey)
    ).toBe(1);
  });
});
