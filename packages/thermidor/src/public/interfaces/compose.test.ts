import {describe, it, expect, vi} from 'vitest';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  ComposedInterface,
  composeInterfaces,
  getComposedInternals,
} from './compose.js';
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';

function createMockThunk(label: string) {
  return createAsyncThunk<void, {engine: FullEngine}>(
    `mock/${label}`,
    async () => {}
  );
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

  it('throws when interfaces have different types', () => {
    const engine = getFullEngine(new Engine());
    const searchIface = new TestSearchInterface(engine, 'a');
    const commerceIface = new TestCommerceInterface(engine, 'b');

    expect(() =>
      composeInterfaces({
        interfaces: [searchIface, commerceIface] as BaseInterface<'search'>[],
      })
    ).toThrow(
      "All interfaces must share the same type. Expected 'search', got 'commerce'."
    );
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
  it('resolveFacades returns thunks from all sub-interfaces (flat-mapped)', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');
    const ifaceB = new TestSearchInterface(engine, 'b');

    const composed = new ComposedInterface([ifaceA, ifaceB], 'composed-1');
    const thunks = composed.resolveFacades('search');

    expect(thunks).toHaveLength(2);
  });

  it('resolveFacades passes the composed ID to each sub-interface', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');
    const ifaceB = new TestSearchInterface(engine, 'b');

    const spyA = vi.spyOn(ifaceA, 'resolveFacades');
    const spyB = vi.spyOn(ifaceB, 'resolveFacades');

    const composed = new ComposedInterface([ifaceA, ifaceB], 'composed-1');
    composed.resolveFacades('search');

    expect(spyA).toHaveBeenCalledWith('search', 'composed-1');
    expect(spyB).toHaveBeenCalledWith('search', 'composed-1');
  });

  it('resolveFacades uses the stateId when no composedInterfaceId is passed', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');

    const spyA = vi.spyOn(ifaceA, 'resolveFacades');

    const composed = new ComposedInterface([ifaceA], 'my-composed-id');
    composed.resolveFacades('search');

    expect(spyA).toHaveBeenCalledWith('search', 'my-composed-id');
  });

  it('resolveFacades respects an explicit composedInterfaceId', () => {
    const engine = getFullEngine(new Engine());
    const ifaceA = new TestSearchInterface(engine, 'a');

    const spyA = vi.spyOn(ifaceA, 'resolveFacades');

    const composed = new ComposedInterface([ifaceA], 'my-composed-id');
    composed.resolveFacades('search', 'override-id');

    expect(spyA).toHaveBeenCalledWith('search', 'override-id');
  });

  it('dispose does not throw and is a no-op', () => {
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
