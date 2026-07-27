import {describe, it, expect, vi} from 'vitest';
import {BaseInterface, getInterfaceInternals} from './base-interface.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
  EndpointThunk,
  EndpointStateScope,
} from './interface-types.js';

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

class TestInterface extends BaseInterface<'search'> {
  constructor(
    engine: FullEngine,
    stateId: string,
    resolvers: Record<Facades['search'], FacadeResolverFactory>
  ) {
    super(engine, stateId, 'search', resolvers);
  }
}

function createTestSubject(options?: {
  engine?: FullEngine;
  stateId?: string;
  searchFactory?: FacadeResolverFactory;
  suggestionsFactory?: FacadeResolverFactory;
}) {
  const engine = options?.engine ?? createMockEngine();
  const stateId = options?.stateId ?? 'test-id';

  const searchThunk = createMockThunk();
  const suggestionsThunk = createMockThunk();

  const searchFactory: FacadeResolverFactory =
    options?.searchFactory ?? ((_engine) => (_scope) => searchThunk);
  const suggestionsFactory: FacadeResolverFactory =
    options?.suggestionsFactory ?? ((_engine) => (_scope) => suggestionsThunk);

  const instance = new TestInterface(engine, stateId, {
    search: searchFactory,
    suggestions: suggestionsFactory,
  });

  return {instance, engine, stateId, searchThunk, suggestionsThunk};
}

describe('BaseInterface', () => {
  describe('constructor', () => {
    it('stores the engine accessible via getInterfaceInternals', () => {
      const {instance, engine} = createTestSubject();
      expect(getInterfaceInternals(instance).engine).toBe(engine);
    });

    it('stores the stateId accessible via getInterfaceInternals', () => {
      const {instance} = createTestSubject({stateId: 'my-interface-42'});
      expect(getInterfaceInternals(instance).stateId).toBe('my-interface-42');
    });

    it('stores the type accessible via getInterfaceInternals', () => {
      const {instance} = createTestSubject();
      expect(getInterfaceInternals(instance).type).toBe('search');
    });
  });

  describe('resolveFacades', () => {
    it('returns an array with one EndpointThunk', () => {
      const {instance} = createTestSubject();
      const result = getInterfaceInternals(instance).resolveFacades('search');
      expect(result).toHaveLength(1);
    });

    it('returns the same cached thunk on repeated calls (caching)', () => {
      const {instance} = createTestSubject();
      const first = getInterfaceInternals(instance).resolveFacades('search');
      const second = getInterfaceInternals(instance).resolveFacades('search');
      expect(first[0]).toBe(second[0]);
    });

    it('invokes the factory only once for the same facade and scope', () => {
      const factorySpy = vi.fn((_engine: FullEngine) => {
        const thunk = createMockThunk();
        return (_scope: EndpointStateScope) => thunk;
      });

      const {instance} = createTestSubject({searchFactory: factorySpy});

      getInterfaceInternals(instance).resolveFacades('search');
      getInterfaceInternals(instance).resolveFacades('search');
      getInterfaceInternals(instance).resolveFacades('search');

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('caches the thunk when composed', () => {
      const {instance} = createTestSubject();

      const composedA = {
        supportedFacades: ['search', 'suggestions'],
        disposed: false,
        dispose: vi.fn(),
      } as any;

      const resultA = getInterfaceInternals(instance).resolveFacades('search', composedA);
      const resultB = getInterfaceInternals(instance).resolveFacades('search', composedA);

      expect(resultA[0]).toBe(resultB[0]);
    });

    it('returns different thunks for composed vs standalone', () => {
      const thunkA = createMockThunk();
      const thunkB = createMockThunk();
      let callCount = 0;

      const factory: FacadeResolverFactory = (_engine) => (_scope) => {
        callCount++;
        return callCount === 1 ? thunkA : thunkB;
      };

      const {instance} = createTestSubject({searchFactory: factory});

      const composedA = {
        supportedFacades: ['search', 'suggestions'],
        disposed: false,
        dispose: vi.fn(),
      } as any;

      const resultComposed = getInterfaceInternals(instance).resolveFacades('search', composedA);
      const resultStandalone = getInterfaceInternals(instance).resolveFacades('search');

      expect(resultComposed[0]).toBe(thunkA);
      expect(resultStandalone[0]).toBe(thunkB);
    });

    it('returns the cached thunk for the same composedInterface', () => {
      const {instance} = createTestSubject();
      const composedX = {
        supportedFacades: ['search', 'suggestions'],
        disposed: false,
        dispose: vi.fn(),
      } as any;
      const first = getInterfaceInternals(instance).resolveFacades('search', composedX);
      const second = getInterfaceInternals(instance).resolveFacades('search', composedX);
      expect(first[0]).toBe(second[0]);
    });
  });

  describe('dispose', () => {
    it('returns disposed=false before dispose is called', () => {
      const {instance} = createTestSubject();
      expect(instance.disposed).toBe(false);
    });

    it('returns disposed=true after dispose is called', () => {
      const {instance} = createTestSubject();
      instance.dispose();
      expect(instance.disposed).toBe(true);
    });

    it('throws when resolveFacades is called after dispose', () => {
      const {instance} = createTestSubject();
      instance.dispose();
      expect(() => getInterfaceInternals(instance).resolveFacades('search')).toThrow(
        'Cannot operate on a disposed interface.'
      );
    });
  });
});
