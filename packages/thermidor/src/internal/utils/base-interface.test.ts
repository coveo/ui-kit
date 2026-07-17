import {describe, it, expect, vi} from 'vitest';
import {BaseInterface, getInterfaceInternals} from './base-interface.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
  EndpointThunk,
  InterfaceHandle,
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
    options?.searchFactory ?? ((_engine) => (_iface) => searchThunk);
  const suggestionsFactory: FacadeResolverFactory =
    options?.suggestionsFactory ?? ((_engine) => (_iface) => suggestionsThunk);

  const instance = new TestInterface(engine, stateId, {
    search: searchFactory,
    suggestions: suggestionsFactory,
  });

  return {instance, engine, stateId, searchThunk, suggestionsThunk};
}

describe('BaseInterface', () => {
  describe('getInterfaceInternals', () => {
    it('throws when passed a non-BaseInterface value', () => {
      const fakeHandle: InterfaceHandle = {
        disposed: false,
        dispose: vi.fn(),
      };

      expect(() => getInterfaceInternals(fakeHandle)).toThrow(
        'Invalid interface handle: expected a BaseInterface instance.'
      );
    });

    it('returns internals for a valid BaseInterface instance', () => {
      const {instance, engine} = createTestSubject();
      const internals = getInterfaceInternals(instance);

      expect(internals.engine).toBe(engine);
      expect(internals.stateId).toBe('test-id');
      expect(internals.type).toBe('search');
    });
  });

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

    it('invokes the factory only once for the same facade', () => {
      const factorySpy = vi.fn((_engine: FullEngine) => {
        const thunk = createMockThunk();
        return (_iface: InterfaceHandle) => thunk;
      });

      const {instance} = createTestSubject({searchFactory: factorySpy});

      getInterfaceInternals(instance).resolveFacades('search');
      getInterfaceInternals(instance).resolveFacades('search');
      getInterfaceInternals(instance).resolveFacades('search');

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('passes the interface instance to the resolver as iface', () => {
      let receivedIface: InterfaceHandle | undefined;

      const factory: FacadeResolverFactory = (_engine) => (iface) => {
        receivedIface = iface;
        return createMockThunk();
      };

      const {instance} = createTestSubject({searchFactory: factory});
      getInterfaceInternals(instance).resolveFacades('search');

      expect(receivedIface).toBe(instance);
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
      expect(() =>
        getInterfaceInternals(instance).resolveFacades('search')
      ).toThrow('Cannot operate on a disposed interface.');
    });
  });
});
