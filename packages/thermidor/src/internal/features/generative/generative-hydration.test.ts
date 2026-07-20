import {beforeEach, describe, it, expect, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  type Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/internal/engine/index.js';
import {
  createHydrateSubInterface,
  rehydrateRoutedInterfaces,
} from './generative-hydration.js';
import {RoutedInterfaceRegistry} from './routed-interface-registry.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/index.js';
import {SearchInterfaceImpl} from '@/src/internal/interfaces/index.js';
import type {HydrateSubInterface} from '@/src/internal/api/generative/index.js';

describe('createHydrateSubInterface', () => {
  let engine: Engine;
  let fullEngine: FullEngine;

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
  });

  it('returns null for an unknown activity type', () => {
    const hydrate = createHydrateSubInterface(fullEngine);

    const result = hydrate('unknown_activity', {results: []});

    expect(result).toBeNull();
  });

  it('returns a CommerceInterfaceImpl for commerce_search_api_response', () => {
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {results: [{title: 'Shoes'}]};

    const result = hydrate('commerce_search_api_response', content, 'shoes');

    expect(result).not.toBeNull();
    expect(result!.useCase).toBe('commerceSearch');
    expect(result!.interface).toBeInstanceOf(CommerceInterfaceImpl);
    expect(result!.snapshot).toBe(content);
    expect(result!.query).toBe('shoes');
  });

  it('returns a SearchInterfaceImpl for search_api_response', () => {
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {results: [{title: 'Doc'}]};

    const result = hydrate('search_api_response', content, 'docs');

    expect(result).not.toBeNull();
    expect(result!.useCase).toBe('search');
    expect(result!.interface).toBeInstanceOf(SearchInterfaceImpl);
    expect(result!.snapshot).toBe(content);
    expect(result!.query).toBe('docs');
  });

  it('uses queryCorrection.correctedQuery over the fallback query', () => {
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {
      results: [],
      queryCorrection: {correctedQuery: 'corrected'},
    };

    const result = hydrate('commerce_search_api_response', content, 'typo');

    expect(result!.query).toBe('corrected');
  });

  it('falls back to the provided query when queryCorrection is absent', () => {
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {results: []};

    const result = hydrate('search_api_response', content, 'fallback');

    expect(result!.query).toBe('fallback');
  });

  it('returns undefined query when neither queryCorrection nor fallback are provided', () => {
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {results: []};

    const result = hydrate('search_api_response', content);

    expect(result!.query).toBeUndefined();
  });

  it('ignores queryCorrection with null correctedQuery', () => {
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {
      results: [],
      queryCorrection: {correctedQuery: null},
    };

    const result = hydrate('commerce_search_api_response', content, 'original');

    expect(result!.query).toBe('original');
  });

  it('stores the hydration snapshot on the engine', () => {
    const spy = vi.spyOn(fullEngine, 'storeHydrationSnapshot');
    const hydrate = createHydrateSubInterface(fullEngine);
    const content = {results: []};

    const result = hydrate('commerce_search_api_response', content);

    expect(spy).toHaveBeenCalledWith(content, result!.interface);
  });
});

describe('rehydrateRoutedInterfaces', () => {
  let registry: RoutedInterfaceRegistry;
  let mockHydrate: HydrateSubInterface;

  beforeEach(() => {
    registry = new RoutedInterfaceRegistry();
    mockHydrate = vi.fn();
  });

  it('skips turns without routedInterface', () => {
    const turns = [{id: 'turn-1'}];

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(mockHydrate).not.toHaveBeenCalled();
    expect(registry.get('turn-1')).toBeUndefined();
  });

  it('skips turns where routedInterface has no snapshot', () => {
    const turns = [
      {id: 'turn-1', routedInterface: {useCase: 'commerceSearch'}},
    ];

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(mockHydrate).not.toHaveBeenCalled();
  });

  it('skips turns with an unknown useCase', () => {
    const turns = [
      {
        id: 'turn-1',
        routedInterface: {
          useCase: 'unknownUseCase',
          snapshot: {results: []},
        },
      },
    ];

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(mockHydrate).not.toHaveBeenCalled();
  });

  it('calls hydrateSubInterface with the correct activity type and snapshot for commerceSearch', () => {
    const snapshot = {results: [{title: 'Product'}]};
    const turns = [
      {
        id: 'turn-1',
        routedInterface: {
          useCase: 'commerceSearch',
          snapshot,
          query: 'shoes',
        },
      },
    ];

    const mockResult = {
      useCase: 'commerceSearch' as const,
      interface: {} as any,
      snapshot,
      query: 'shoes',
    };
    (mockHydrate as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(mockHydrate).toHaveBeenCalledWith(
      'commerce_search_api_response',
      snapshot,
      'shoes'
    );
  });

  it('calls hydrateSubInterface with the correct activity type for search', () => {
    const snapshot = {results: []};
    const turns = [
      {
        id: 'turn-1',
        routedInterface: {useCase: 'search', snapshot, query: 'docs'},
      },
    ];

    const mockResult = {
      useCase: 'search' as const,
      interface: {} as any,
      snapshot,
      query: 'docs',
    };
    (mockHydrate as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(mockHydrate).toHaveBeenCalledWith(
      'search_api_response',
      snapshot,
      'docs'
    );
  });

  it('registers the hydration result in the registry', () => {
    const snapshot = {results: []};
    const iface = {} as any;
    const turns = [
      {
        id: 'turn-1',
        routedInterface: {useCase: 'commerceSearch', snapshot, query: 'q'},
      },
    ];

    (mockHydrate as ReturnType<typeof vi.fn>).mockReturnValue({
      useCase: 'commerceSearch',
      interface: iface,
      snapshot,
      query: 'q',
    });

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    const entry = registry.get('turn-1');
    expect(entry).toBeDefined();
    expect(entry!.useCase).toBe('commerceSearch');
    expect(entry!.interface).toBe(iface);
    expect(entry!.snapshot).toBe(snapshot);
    expect(entry!.query).toBe('q');
  });

  it('does not register when hydrateSubInterface returns null', () => {
    const turns = [
      {
        id: 'turn-1',
        routedInterface: {
          useCase: 'commerceSearch',
          snapshot: {results: []},
        },
      },
    ];

    (mockHydrate as ReturnType<typeof vi.fn>).mockReturnValue(null);

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(registry.get('turn-1')).toBeUndefined();
  });

  it('processes multiple turns independently', () => {
    const snapshot1 = {results: [{title: 'A'}]};
    const snapshot2 = {results: [{title: 'B'}]};
    const iface1 = {id: 1} as any;
    const iface2 = {id: 2} as any;

    const turns = [
      {
        id: 'turn-1',
        routedInterface: {
          useCase: 'commerceSearch',
          snapshot: snapshot1,
          query: 'a',
        },
      },
      {id: 'turn-2'}, // no routedInterface, should be skipped
      {
        id: 'turn-3',
        routedInterface: {useCase: 'search', snapshot: snapshot2, query: 'b'},
      },
    ];

    (mockHydrate as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({
        useCase: 'commerceSearch',
        interface: iface1,
        snapshot: snapshot1,
        query: 'a',
      })
      .mockReturnValueOnce({
        useCase: 'search',
        interface: iface2,
        snapshot: snapshot2,
        query: 'b',
      });

    rehydrateRoutedInterfaces(turns, registry, mockHydrate);

    expect(mockHydrate).toHaveBeenCalledTimes(2);
    expect(registry.get('turn-1')!.interface).toBe(iface1);
    expect(registry.get('turn-2')).toBeUndefined();
    expect(registry.get('turn-3')!.interface).toBe(iface2);
  });
});
