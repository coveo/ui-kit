import {describe, it, expect, vi} from 'vitest';
import {GenerativeUnifiedInterfaceImpl} from './generative-unified.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';

function createMockEngine(): FullEngine {
  return {
    mutate: vi.fn(),
    read: vi.fn(),
    subscribe: vi.fn(),
    adoptSlice: vi.fn(),
    storeHydrationSnapshot: vi.fn(),
    getNavigatorContextProvider: vi.fn(),
    addInterface: vi.fn(),
    removeInterface: vi.fn(),
  } as unknown as FullEngine;
}

describe('GenerativeUnifiedInterfaceImpl', () => {
  it('calls engine.adoptSlice with the generative slice on construction', () => {
    const engine = createMockEngine();

    new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

    expect(engine.adoptSlice).toHaveBeenCalledOnce();
  });

  it('resolveFacades("conversation") returns a thunk array of length 1', () => {
    const engine = createMockEngine();
    const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

    const thunks = getInterfaceInternals(instance).resolveFacades('conversation');

    expect(thunks).toHaveLength(1);
  });

  describe('dispose', () => {
    it('sets disposed to true', () => {
      const engine = createMockEngine();
      const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

      instance.dispose();

      expect(instance.disposed).toBe(true);
    });

    it('calls engine.removeInterface', () => {
      const engine = createMockEngine();
      const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

      instance.dispose();

      expect(engine.removeInterface).toHaveBeenCalledWith(instance);
    });

    it('is idempotent — double dispose does not throw and calls removeInterface once', () => {
      const engine = createMockEngine();
      const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

      instance.dispose();
      expect(() => instance.dispose()).not.toThrow();

      expect(engine.removeInterface).toHaveBeenCalledOnce();
    });

    it('throws when resolveFacades is called after dispose', () => {
      const engine = createMockEngine();
      const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

      instance.dispose();

      expect(() => getInterfaceInternals(instance).resolveFacades('conversation')).toThrow(
        'Cannot operate on a disposed interface.'
      );
    });
  });
});
