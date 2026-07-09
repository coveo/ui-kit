import {describe, it, expect} from 'vitest';
import {
  ComposedInterface,
  composeInterfaces,
  getComposedInternals,
} from './compose.js';
import {
  BaseInterface,
  createNoopThunk,
  getInterfaceInternals,
} from '@/src/internal/utils/index.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/internal/engine/index.js';

function createMockThunk(label: string) {
  return createNoopThunk(label);
}

const mockSearchThunk = createMockThunk('search');
const mockSuggestionsThunk = createMockThunk('suggestions');

class TestSearchInterface extends BaseInterface<'search'> {
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'search', {
      search: () => () => mockSearchThunk,
      suggestions: () => () => mockSuggestionsThunk,
    });
  }
}

class TestCommerceInterface extends BaseInterface<'commerce'> {
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'commerce', {
      search: () => () => mockSearchThunk,
      suggestions: () => () => mockSuggestionsThunk,
    });
  }
}

describe('composeInterfaces', () => {
  it('throws when called with an empty array', () => {
    expect(() => composeInterfaces({interfaces: []})).toThrow(
      'composeInterfaces requires at least one interface.'
    );
  });

  it('throws when interfaces use different engines', () => {
    const engineA = getFullEngine(new Engine());
    const engineB = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engineA, 'a');
    const ifaceB = new TestSearchInterface(engineB, 'b');

    expect(() => composeInterfaces({interfaces: [ifaceA, ifaceB]})).toThrow(
      'All interfaces must share the same engine.'
    );
  });

  it('accepts interfaces with different types', () => {
    const engine = getFullEngine(new Engine());
    const searchInterface = new TestSearchInterface(engine, 'a');
    const commerceInterface = new TestCommerceInterface(engine, 'b');

    const composed = composeInterfaces({
      interfaces: [searchInterface, commerceInterface],
    });

    expect(composed).toBeInstanceOf(ComposedInterface);
  });

  it('returns a ComposedInterface instance for valid inputs', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');
    const ifaceB = new TestSearchInterface(engine, 'b');

    const composed = composeInterfaces({interfaces: [ifaceA, ifaceB]});

    expect(composed).toBeInstanceOf(ComposedInterface);
  });

  it('assigns a unique stateId to the composed interface', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');

    const composed = composeInterfaces({interfaces: [ifaceA]});
    const {stateId} = getComposedInternals(composed);

    expect(typeof stateId).toBe('string');
    expect(stateId.length).toBeGreaterThan(0);
  });
});

describe('ComposedInterface', () => {
  it('throws when constructed with an empty array', () => {
    expect(() => new ComposedInterface([], 'composed-empty')).toThrow(
      'ComposedInterface requires at least one interface.'
    );
  });

  it('resolveFacades returns thunks from all sub-interfaces (flat-mapped)', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');
    const ifaceB = new TestSearchInterface(engine, 'b');

    const composed = new ComposedInterface([ifaceA, ifaceB], 'composed-1');
    const thunks = getComposedInternals(composed).resolveFacades('search');

    expect(thunks).toHaveLength(2);
  });

  it('resolveFacades passes the composed ID to each sub-interface', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');
    const ifaceB = new TestSearchInterface(engine, 'b');

    const composed = new ComposedInterface([ifaceA, ifaceB], 'composed-1');

    const thunksA = getInterfaceInternals(ifaceA).resolveFacades(
      'search',
      composed
    );
    const thunksB = getInterfaceInternals(ifaceB).resolveFacades(
      'search',
      composed
    );
    const composedThunks =
      getComposedInternals(composed).resolveFacades('search');

    expect(composedThunks).toHaveLength(2);
    expect(composedThunks[0]).toBe(thunksA[0]);
    expect(composedThunks[1]).toBe(thunksB[0]);
  });

  it('resolveFacades uses the stateId when no composedInterfaceId is passed', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');

    const composed = new ComposedInterface([ifaceA], 'my-composed-id');
    const thunks = getComposedInternals(composed).resolveFacades('search');

    const thunksViaInterface = getInterfaceInternals(ifaceA).resolveFacades(
      'search',
      composed
    );
    expect(thunks[0]).toBe(thunksViaInterface[0]);
  });

  it('resolveFacades respects an explicit composedInterface', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');
    const overrideInterface = new TestSearchInterface(engine, 'override-id');

    const composed = new ComposedInterface([ifaceA], 'my-composed-id');
    const thunks = getComposedInternals(composed).resolveFacades(
      'search',
      overrideInterface
    );

    const thunksViaInterface = getInterfaceInternals(ifaceA).resolveFacades(
      'search',
      overrideInterface
    );
    expect(thunks[0]).toBe(thunksViaInterface[0]);
  });

  it('dispose does not throw', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');

    const composed = new ComposedInterface([ifaceA], 'composed-1');

    expect(() => composed.dispose()).not.toThrow();
  });

  it('stateId is set to the composed ID via getComposedInternals', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');

    const composed = new ComposedInterface([ifaceA], 'test-composed-id');
    const {stateId} = getComposedInternals(composed);

    expect(stateId).toBe('test-composed-id');
  });
});
