import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {
  createHydrateSubInterface,
  getOrCreateHydrateFromSnapshotAction,
} from './generative-hydration.js';
import {getOrCreateProductListSlice} from '@/src/internal/features/product-list/index.js';
import {getOrCreateResultsSlice} from '@/src/internal/features/result-list/index.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';

function createTestEngine() {
  return new Engine({
    configuration: {
      organizationId: 'test-org',
      accessToken: 'test-token',
      trackingId: 'test',
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
  });
}

describe('getOrCreateHydrateFromSnapshotAction', () => {
  it('returns the same action for the same interfaceId', () => {
    const engine = createTestEngine();
    const iface = buildSearchInterface({engine, id: 'test-id'});
    const action1 = getOrCreateHydrateFromSnapshotAction(iface);
    const action2 = getOrCreateHydrateFromSnapshotAction(iface);
    expect(action1).toBe(action2);
  });

  it('returns different actions for different interfaceIds', () => {
    const engine = createTestEngine();
    const ifaceA = buildSearchInterface({engine, id: 'id-a'});
    const ifaceB = buildSearchInterface({engine, id: 'id-b'});
    const action1 = getOrCreateHydrateFromSnapshotAction(ifaceA);
    const action2 = getOrCreateHydrateFromSnapshotAction(ifaceB);
    expect(action1).not.toBe(action2);
  });

  it('creates an action with the correct type pattern', () => {
    const engine = createTestEngine();
    const iface = buildSearchInterface({engine, id: 'my-interface'});
    const action = getOrCreateHydrateFromSnapshotAction(iface);
    expect(action.type).toBe('my-interface/hydrateFromSnapshot');
  });
});

describe('createHydrateSubInterface', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
  });

  it('returns null for unrecognized activity types', () => {
    const hydrate = createHydrateSubInterface(engine);
    const result = hydrate('unknown-activity-type', {});
    expect(result).toBeNull();
  });

  it('returns a RoutedInterface for commerce-search-api-response', () => {
    const hydrate = createHydrateSubInterface(engine);
    const content = {
      products: [
        {
          permanentid: 'p1',
          ec_name: 'Product 1',
          ec_price: 29.99,
          clickUri: 'https://example.com/p1',
        },
      ],
      pagination: {totalEntries: 1},
      facets: [],
    };

    const result = hydrate('commerce-search-api-response', content);
    expect(result).not.toBeNull();
    expect(result!.useCase).toBe('commerceSearch');
    expect(result!.interface).toBeDefined();
    const {stateId} = getInterfaceInternals(result!.interface);
    expect(stateId).toBeDefined();
  });

  it('returns a RoutedInterface for search-api-response', () => {
    const hydrate = createHydrateSubInterface(engine);
    const content = {
      results: [
        {
          uniqueId: 'r1',
          title: 'Result 1',
          uri: 'https://example.com/r1',
          printableUri: 'example.com/r1',
          clickUri: 'https://example.com/r1',
          raw: {},
          score: 90,
        },
      ],
      totalCount: 1,
      facets: [],
    };

    const result = hydrate('search-api-response', content);
    expect(result).not.toBeNull();
    expect(result!.useCase).toBe('search');
    expect(result!.interface).toBeDefined();
  });

  it('stores hydration snapshot and hydrates products into the sub-interface', async () => {
    const hydrate = createHydrateSubInterface(engine);
    const content = {
      products: [
        {
          permanentid: 'p1',
          ec_name: 'Test Product',
          ec_price: 42.0,
          clickUri: 'https://example.com/p1',
        },
      ],
      pagination: {totalEntries: 1},
      facets: [],
    };

    const result = hydrate('commerce-search-api-response', content);
    const subInterface = result!.interface;
    const fullEngine = getFullEngine(engine);

    const productSlice = getOrCreateProductListSlice(subInterface);
    await fullEngine.adoptSlice(productSlice);
    const productState = fullEngine.read(
      (state: Record<string, unknown>) =>
        state[productSlice.name] as {products: unknown[]}
    );
    expect(productState.products).toHaveLength(1);
    expect(productState.products[0]).toMatchObject({
      permanentid: 'p1',
      ec_name: 'Test Product',
    });
  });

  it('stores hydration snapshot and hydrates results into the sub-interface', async () => {
    const hydrate = createHydrateSubInterface(engine);
    const content = {
      results: [
        {
          uniqueId: 'r1',
          title: 'Result 1',
          uri: 'https://example.com/r1',
          printableUri: 'example.com/r1',
          clickUri: 'https://example.com/r1',
          raw: {field1: 'value1'},
          score: 95,
        },
      ],
      totalCount: 42,
      facets: [],
    };

    const result = hydrate('search-api-response', content);
    const subInterface = result!.interface;
    const fullEngine = getFullEngine(engine);

    const resultsSlice = getOrCreateResultsSlice(subInterface);
    await fullEngine.adoptSlice(resultsSlice);
    const resultState = fullEngine.read(
      (state: Record<string, unknown>) =>
        state[resultsSlice.name] as {results: unknown[]}
    );
    expect(resultState.results).toHaveLength(1);
    expect(resultState.results[0]).toMatchObject({
      uniqueId: 'r1',
      title: 'Result 1',
    });
  });

  describe('effective query resolution', () => {
    function readSearchBoxQuery(subInterface: InterfaceHandle) {
      const fullEngine = getFullEngine(engine);
      const searchBoxSlice = getOrCreateSearchBoxSlice(subInterface);
      const state = fullEngine.read(
        (s: Record<string, unknown>) =>
          s[searchBoxSlice.name] as {query: string} | undefined
      );
      return state;
    }

    function makeCommercePayload(queryCorrection?: {
      correctedQuery?: string | null;
    }) {
      return {
        products: [
          {
            permanentid: 'p1',
            ec_name: 'Product',
            ec_price: 10,
            clickUri: 'https://example.com',
          },
        ],
        pagination: {totalEntries: 1},
        facets: [],
        ...(queryCorrection !== undefined ? {queryCorrection} : {}),
      };
    }

    it('uses correctedQuery when non-empty', () => {
      const hydrate = createHydrateSubInterface(engine);
      const content = makeCommercePayload({
        correctedQuery: 'corrected shoes',
      });

      const result = hydrate('commerce-search-api-response', content, 'shoes');
      expect(result).not.toBeNull();

      const searchBoxState = readSearchBoxQuery(result!.interface);
      expect(searchBoxState?.query).toBe('corrected shoes');
    });

    it('falls back to user prompt when correctedQuery is null', () => {
      const hydrate = createHydrateSubInterface(engine);
      const content = makeCommercePayload({correctedQuery: null});

      const result = hydrate(
        'commerce-search-api-response',
        content,
        'running shoes'
      );
      expect(result).not.toBeNull();

      const searchBoxState = readSearchBoxQuery(result!.interface);
      expect(searchBoxState?.query).toBe('running shoes');
    });

    it('falls back to user prompt when correctedQuery is empty string', () => {
      const hydrate = createHydrateSubInterface(engine);
      const content = makeCommercePayload({correctedQuery: ''});

      const result = hydrate(
        'commerce-search-api-response',
        content,
        'sneakers'
      );
      expect(result).not.toBeNull();

      const searchBoxState = readSearchBoxQuery(result!.interface);
      expect(searchBoxState?.query).toBe('sneakers');
    });

    it('falls back to user prompt when queryCorrection is absent', () => {
      const hydrate = createHydrateSubInterface(engine);
      const content = makeCommercePayload();

      const result = hydrate(
        'commerce-search-api-response',
        content,
        'running shoes'
      );
      expect(result).not.toBeNull();

      const searchBoxState = readSearchBoxQuery(result!.interface);
      expect(searchBoxState?.query).toBe('running shoes');
    });

    it('does not set query when neither correctedQuery nor prompt is provided', () => {
      const hydrate = createHydrateSubInterface(engine);
      const content = makeCommercePayload();

      const result = hydrate(
        'commerce-search-api-response',
        content,
        undefined
      );
      expect(result).not.toBeNull();

      const searchBoxState = readSearchBoxQuery(result!.interface);
      expect(searchBoxState).toBeUndefined();
    });

    it('does not set query when correctedQuery is undefined and no prompt', () => {
      const hydrate = createHydrateSubInterface(engine);
      const content = makeCommercePayload({correctedQuery: undefined});

      const result = hydrate(
        'commerce-search-api-response',
        content,
        undefined
      );
      expect(result).not.toBeNull();

      const searchBoxState = readSearchBoxQuery(result!.interface);
      expect(searchBoxState).toBeUndefined();
    });
  });
});
