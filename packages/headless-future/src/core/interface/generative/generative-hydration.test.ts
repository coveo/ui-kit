import {describe, it, expect, beforeEach} from 'vitest';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  ACTIVITY_TYPE_TO_USE_CASE,
  createHydrateSubInterface,
  getOrCreateHydrateFromSnapshotAction,
} from './generative-hydration.js';
import {STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateProductListSlice} from '@/src/core/internal/product-list/product-list-slice.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import type {BuilderRegistry} from '@/src/public/interfaces/generative.js';
import type {ControllerBuilder} from '@/src/core/interface/generative/generative-types.js';
import {buildProductListController} from '@/src/public/controllers/product-list/product-list-controller.js';
import {buildResultListController} from '@/src/public/controllers/result-list/result-list-controller.js';

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

describe('ACTIVITY_TYPE_TO_USE_CASE', () => {
  it('maps commerce-search-api-response to commerceSearchControllers', () => {
    expect(ACTIVITY_TYPE_TO_USE_CASE['commerce-search-api-response']).toBe(
      'commerceSearchControllers'
    );
  });

  it('maps search-api-response to searchControllers', () => {
    expect(ACTIVITY_TYPE_TO_USE_CASE['search-api-response']).toBe(
      'searchControllers'
    );
  });

  it('does not map unknown activity types', () => {
    expect(ACTIVITY_TYPE_TO_USE_CASE['unknown-type']).toBeUndefined();
  });
});

describe('getOrCreateHydrateFromSnapshotAction', () => {
  it('returns the same action for the same interfaceId', () => {
    const action1 = getOrCreateHydrateFromSnapshotAction('test-id');
    const action2 = getOrCreateHydrateFromSnapshotAction('test-id');
    expect(action1).toBe(action2);
  });

  it('returns different actions for different interfaceIds', () => {
    const action1 = getOrCreateHydrateFromSnapshotAction('id-a');
    const action2 = getOrCreateHydrateFromSnapshotAction('id-b');
    expect(action1).not.toBe(action2);
  });

  it('creates an action with the correct type pattern', () => {
    const action = getOrCreateHydrateFromSnapshotAction('my-interface');
    expect(action.type).toBe('my-interface/hydrateFromSnapshot');
  });
});

describe('createHydrateSubInterface', () => {
  let engine: Engine;
  let builderRegistry: BuilderRegistry;

  beforeEach(() => {
    engine = createTestEngine();
    builderRegistry = {
      commerceSearchControllers: [
        buildProductListController as unknown as ControllerBuilder,
      ],
      searchControllers: [
        buildResultListController as unknown as ControllerBuilder,
      ],
    };
  });

  it('returns null for unrecognized activity types', () => {
    const hydrate = createHydrateSubInterface(engine, builderRegistry);
    const result = hydrate('unknown-activity-type', {});
    expect(result).toBeNull();
  });

  it('returns a RoutedInterface for commerce-search-api-response', () => {
    const hydrate = createHydrateSubInterface(engine, builderRegistry);
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
    expect(result!.interface[STATE_ID]).toBeDefined();
  });

  it('returns a RoutedInterface for search-api-response', () => {
    const hydrate = createHydrateSubInterface(engine, builderRegistry);
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

  it('hydrates products into the sub-interface via the registered builder', () => {
    const hydrate = createHydrateSubInterface(engine, builderRegistry);
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
    const subId = result!.interface[STATE_ID];
    const fullEngine = getFullEngine(engine);

    const productSlice = getOrCreateProductListSlice(subId);
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

  it('hydrates results into the sub-interface via the registered builder', () => {
    const hydrate = createHydrateSubInterface(engine, builderRegistry);
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
    const subId = result!.interface[STATE_ID];
    const fullEngine = getFullEngine(engine);

    const resultsSlice = getOrCreateResultsSlice(subId);
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

  it('only adopts slices for registered builders (not all slices)', () => {
    const registryWithOnlyProducts: BuilderRegistry = {
      commerceSearchControllers: [
        buildProductListController as unknown as ControllerBuilder,
      ],
      searchControllers: [],
    };

    const hydrate = createHydrateSubInterface(engine, registryWithOnlyProducts);
    const content = {
      products: [{permanentid: 'p1', ec_name: 'P1'}],
      pagination: {totalEntries: 1},
      facets: [],
    };

    const result = hydrate('commerce-search-api-response', content);
    const subId = result!.interface[STATE_ID];
    const fullEngine = getFullEngine(engine);

    // Product slice was adopted (by the registered builder)
    const productSlice = getOrCreateProductListSlice(subId);
    const productState = fullEngine.read(
      (state: Record<string, unknown>) =>
        state[productSlice.name] as {products: unknown[]}
    );
    expect(productState.products).toHaveLength(1);
  });
});
