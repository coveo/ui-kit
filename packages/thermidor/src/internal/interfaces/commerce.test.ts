import {describe, it, expect, vi} from 'vitest';
import {CommerceInterfaceImpl} from './commerce.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {FacadeResolverFactory, Facades, EndpointThunk} from '@/src/internal/utils/index.js';

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

function createMockThunk(): EndpointThunk {
  return vi.fn() as unknown as EndpointThunk;
}

describe('CommerceInterfaceImpl', () => {
  describe('when customResolvers is not provided', () => {
    it('uses the default search resolver', () => {
      const engine = createMockEngine();
      const instance = new CommerceInterfaceImpl(engine, 'test-id');

      const thunks = getInterfaceInternals(instance).resolveFacades('search');

      expect(thunks).toHaveLength(1);
    });

    it('uses the default suggestions resolver', () => {
      const engine = createMockEngine();
      const instance = new CommerceInterfaceImpl(engine, 'test-id');

      const thunks = getInterfaceInternals(instance).resolveFacades('suggestions');

      expect(thunks).toHaveLength(1);
    });
  });

  describe('when customResolvers is provided', () => {
    it('uses the custom search resolver instead of the default', () => {
      const engine = createMockEngine();
      const customSearchThunk = createMockThunk();
      const customSuggestionsThunk = createMockThunk();

      const customResolvers: Record<Facades['commerce'], FacadeResolverFactory> = {
        search: (_engine) => (_scope) => customSearchThunk,
        suggestions: (_engine) => (_scope) => customSuggestionsThunk,
      };

      const instance = new CommerceInterfaceImpl(engine, 'test-id', customResolvers);

      const thunks = getInterfaceInternals(instance).resolveFacades('search');

      expect(thunks).toHaveLength(1);
      expect(thunks[0]).toBe(customSearchThunk);
    });

    it('uses the custom suggestions resolver instead of the default', () => {
      const engine = createMockEngine();
      const customSearchThunk = createMockThunk();
      const customSuggestionsThunk = createMockThunk();

      const customResolvers: Record<Facades['commerce'], FacadeResolverFactory> = {
        search: (_engine) => (_scope) => customSearchThunk,
        suggestions: (_engine) => (_scope) => customSuggestionsThunk,
      };

      const instance = new CommerceInterfaceImpl(engine, 'test-id', customResolvers);

      const thunks = getInterfaceInternals(instance).resolveFacades('suggestions');

      expect(thunks).toHaveLength(1);
      expect(thunks[0]).toBe(customSuggestionsThunk);
    });
  });

  describe('when customResolvers provides only a partial override', () => {
    it('uses the custom resolver for the overridden facade', () => {
      const engine = createMockEngine();
      const customSearchThunk = createMockThunk();

      const customResolvers: Partial<Record<Facades['commerce'], FacadeResolverFactory>> = {
        search: (_engine) => (_scope) => customSearchThunk,
      };

      const instance = new CommerceInterfaceImpl(engine, 'test-id', customResolvers);

      const thunks = getInterfaceInternals(instance).resolveFacades('search');

      expect(thunks).toHaveLength(1);
      expect(thunks[0]).toBe(customSearchThunk);
    });

    it('falls back to the default resolver for the non-overridden facade', () => {
      const engine = createMockEngine();
      const customSearchThunk = createMockThunk();

      const customResolvers: Partial<Record<Facades['commerce'], FacadeResolverFactory>> = {
        search: (_engine) => (_scope) => customSearchThunk,
      };

      const instance = new CommerceInterfaceImpl(engine, 'test-id', customResolvers);

      const thunks = getInterfaceInternals(instance).resolveFacades('suggestions');

      expect(thunks).toHaveLength(1);
      expect(thunks[0]).not.toBe(customSearchThunk);
    });
  });
});
