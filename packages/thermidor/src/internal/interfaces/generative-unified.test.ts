import {describe, it, expect, expectTypeOf, vi} from 'vitest';
import {GenerativeUnifiedInterfaceImpl} from './generative-unified.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {GenerativeInterface, GenerativeUnifiedInterface} from '@/src/internal/utils/index.js';

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
  it('is nominally distinct from the legacy generative interface', () => {
    expectTypeOf<GenerativeUnifiedInterface>().not.toMatchTypeOf<GenerativeInterface>();
    expectTypeOf<GenerativeInterface>().not.toMatchTypeOf<GenerativeUnifiedInterface>();
  });

  it('calls engine.adoptSlice with the generative slice on construction', () => {
    const engine = createMockEngine();

    new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

    expect(engine.adoptSlice).toHaveBeenCalledOnce();
  });

  it('resolveFacade("conversation") returns a thunk', () => {
    const engine = createMockEngine();
    const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

    const thunk = getInterfaceInternals(instance).resolveFacade('conversation');

    expect(thunk).toBeDefined();
    expect(typeof thunk).toBe('function');
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

    it('throws when resolveFacade is called after dispose', () => {
      const engine = createMockEngine();
      const instance = new GenerativeUnifiedInterfaceImpl(engine, 'test-id');

      instance.dispose();

      expect(() => getInterfaceInternals(instance).resolveFacade('conversation')).toThrow(
        'Cannot operate on a disposed interface.'
      );
    });
  });
});
