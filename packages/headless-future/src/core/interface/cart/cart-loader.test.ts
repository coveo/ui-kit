import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {loadCart} from './cart-loader.js';

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
  } as unknown as MockEngine;
};

const TEST_ID = 'test-interface';

describe('loadCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adopts cart slice once per interface id', () => {
    const engine = createMockEngine();

    loadCart(engine, TEST_ID);
    loadCart(engine, TEST_ID);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(
      getOrCreateCartSlice(TEST_ID)
    );
  });

  it('adopts independently for different interface ids', () => {
    const engine = createMockEngine();

    loadCart(engine, 'id-a');
    loadCart(engine, 'id-b');

    expect(engine.adoptSlice).toHaveBeenCalledTimes(2);
  });
});
