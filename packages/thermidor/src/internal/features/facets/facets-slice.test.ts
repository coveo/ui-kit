/**
 * Facets Scoped Factories Tests
 */

import {describe, it, expect} from 'vitest';
import {
  createFacetsSlice,
  getOrCreateFacetsSlice,
  initialFacetsState,
} from './facets-slice.js';
import {
  createFacetsActions,
  getOrCreateFacetsActions,
} from './facets-actions.js';
import {
  createFacetsSelectors,
  getOrCreateFacetsSelectors,
} from './facets-selectors.js';
import type {FacetsState} from './facets-types.js';
import type {CoveoFacetResponse} from '@/src/internal/api/search/index.js';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

const sharedEngine = createTestEngine();
const ifaceCache = new Map<string, ReturnType<typeof createTestInterface>>();
function iface(id: string) {
  if (!ifaceCache.has(id)) {
    ifaceCache.set(id, createTestInterface(sharedEngine, id));
  }
  return ifaceCache.get(id)!;
}

describe('createFacetsActions', () => {
  it('should create actions scoped to the interfaceId', () => {
    const actions = createFacetsActions('search');
    expect(actions.updateFromResponse.type).toBe(
      'search/facets/updateFromResponse'
    );
  });

  it('should create different actions for different interfaceIds', () => {
    const actionsA = createFacetsActions('interfaceA');
    const actionsB = createFacetsActions('interfaceB');
    expect(actionsA.updateFromResponse.type).not.toBe(
      actionsB.updateFromResponse.type
    );
  });
});

describe('getOrCreateFacetsActions', () => {
  it('should return the same instance for the same interfaceId', () => {
    const a = getOrCreateFacetsActions(iface('cached-facet-actions'));
    const b = getOrCreateFacetsActions(iface('cached-facet-actions'));
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaceIds', () => {
    const a = getOrCreateFacetsActions(iface('facet-actions-x'));
    const b = getOrCreateFacetsActions(iface('facet-actions-y'));
    expect(a).not.toBe(b);
  });
});

describe('createFacetsSlice', () => {
  it('should have empty object as initial state', () => {
    expect(initialFacetsState).toEqual({});
  });

  it('should create a slice with scoped name', () => {
    const testInterface = iface('myInterface');
    const actions = getOrCreateFacetsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createFacetsSlice('myInterface', actions, hydrateAction);
    expect(slice.name).toBe('myInterface/facets');
  });

  it('should update facet values from response', () => {
    const testInterface = iface('test-response');
    const actions = getOrCreateFacetsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createFacetsSlice('test-response', actions, hydrateAction);

    const stateWithFacet: FacetsState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
    };

    const response: CoveoFacetResponse[] = [
      {
        facetId: 'category',
        field: 'category',
        values: [
          {value: 'Electronics', numberOfResults: 50},
          {value: 'Books', numberOfResults: 30},
        ],
      },
    ];

    const state = slice.reducer(
      stateWithFacet,
      actions.updateFromResponse(response)
    );

    expect(state.category.values).toEqual([
      {id: 'Electronics', label: 'Electronics', count: 50},
      {id: 'Books', label: 'Books', count: 30},
    ]);
  });

  it('should not modify state when response is undefined', () => {
    const testInterface = iface('test-undefined');
    const actions = getOrCreateFacetsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createFacetsSlice('test-undefined', actions, hydrateAction);

    const stateWithFacet: FacetsState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [{id: 'val1', label: 'Value 1', count: 10}],
        selectedValues: ['val1'],
      },
    };

    const state = slice.reducer(
      stateWithFacet,
      actions.updateFromResponse(undefined)
    );

    expect(state).toEqual(stateWithFacet);
  });

  it('should ignore response facets that do not exist in state', () => {
    const testInterface = iface('test-missing');
    const actions = getOrCreateFacetsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createFacetsSlice('test-missing', actions, hydrateAction);

    const response: CoveoFacetResponse[] = [
      {
        facetId: 'nonexistent',
        field: 'nonexistent',
        values: [{value: 'val', numberOfResults: 5}],
      },
    ];

    const state = slice.reducer(
      initialFacetsState,
      actions.updateFromResponse(response)
    );

    expect(state).toEqual(initialFacetsState);
  });

  it('should maintain state immutability', () => {
    const testInterface = iface('test-immutable');
    const actions = getOrCreateFacetsActions(testInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(testInterface);
    const slice = createFacetsSlice('test-immutable', actions, hydrateAction);

    const original: FacetsState = {
      category: {
        id: 'category',
        label: 'Category',
        values: [],
        selectedValues: [],
      },
    };

    const response: CoveoFacetResponse[] = [
      {
        facetId: 'category',
        field: 'category',
        values: [{value: 'New', numberOfResults: 1}],
      },
    ];

    slice.reducer(original, actions.updateFromResponse(response));
    expect(original.category.values).toEqual([]);
  });
});

describe('getOrCreateFacetsSlice', () => {
  it('should return the same instance for the same interfaceId', () => {
    const a = getOrCreateFacetsSlice(iface('cached-facet-slice'));
    const b = getOrCreateFacetsSlice(iface('cached-facet-slice'));
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaceIds', () => {
    const a = getOrCreateFacetsSlice(iface('facet-slice-x'));
    const b = getOrCreateFacetsSlice(iface('facet-slice-y'));
    expect(a).not.toBe(b);
  });
});

describe('createFacetsSelectors', () => {
  it('should build facets request from state', () => {
    const selectors = createFacetsSelectors('myFacets');
    const state = {
      'myFacets/facets': {
        category: {
          id: 'category',
          label: 'Category',
          values: [],
          selectedValues: ['electronics', 'books'],
        },
        brand: {
          id: 'brand',
          label: 'Brand',
          values: [],
          selectedValues: ['nike'],
        },
      } as FacetsState,
    };

    const result = selectors.buildFacetsRequest(state);
    expect(result).toEqual([
      {facetId: 'category', selectedValues: ['electronics', 'books']},
      {facetId: 'brand', selectedValues: ['nike']},
    ]);
  });

  it('should return empty array when no facets exist', () => {
    const selectors = createFacetsSelectors('emptyFacets');
    const state = {'emptyFacets/facets': {} as FacetsState};
    expect(selectors.buildFacetsRequest(state)).toEqual([]);
  });

  it('should return initial state when slice is not present', () => {
    const selectors = createFacetsSelectors('missing');
    const state = {};
    expect(selectors.buildFacetsRequest(state)).toEqual([]);
  });
});

describe('getOrCreateFacetsSelectors', () => {
  it('should return the same instance for the same interfaceId', () => {
    const a = getOrCreateFacetsSelectors(iface('cached-facet-sel'));
    const b = getOrCreateFacetsSelectors(iface('cached-facet-sel'));
    expect(a).toBe(b);
  });

  it('should return different instances for different interfaceIds', () => {
    const a = getOrCreateFacetsSelectors(iface('facet-sel-x'));
    const b = getOrCreateFacetsSelectors(iface('facet-sel-y'));
    expect(a).not.toBe(b);
  });
});
