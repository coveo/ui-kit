import {describe, expect, it} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';
import {getOrCreateBackendSurfacesActions} from './backend-surfaces-actions.js';
import {
  createBackendSurfacesSlice,
  initialBackendSurfacesState,
} from './backend-surfaces-slice.js';

const INTERFACE_ID = 'test-iface';

function createStore() {
  const slice = createBackendSurfacesSlice(INTERFACE_ID);
  return configureStore({reducer: {[slice.name]: slice.reducer}});
}

function getState(store: ReturnType<typeof createStore>) {
  return store.getState()[`${INTERFACE_ID}/backendSurfaces`];
}

describe('backendSurfacesSlice', () => {
  it('has correct initial state', () => {
    const store = createStore();
    expect(getState(store)).toEqual(initialBackendSurfacesState);
  });

  describe('createSurface', () => {
    it('adds a new surface entry', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'red shirt', products: []},
        })
      );

      expect(getState(store).surfaces['ui-1']).toEqual({
        type: 'product_search',
        display: 'main',
        state: {query: 'red shirt', products: []},
      });
    });

    it('demotes the previous main surface to inline when a new main surface is created', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'shoes', products: []},
        })
      );

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-2',
          type: 'product_search',
          display: 'main',
          state: {query: 'jackets', products: []},
        })
      );

      expect(getState(store).surfaces['ui-1'].display).toBe('inline');
      expect(getState(store).surfaces['ui-2'].display).toBe('main');
    });

    it('does not demote an existing main surface when a new inline surface is created', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'shoes', products: []},
        })
      );

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-2',
          type: 'product_recommendations',
          display: 'inline',
          state: {},
        })
      );

      expect(getState(store).surfaces['ui-1'].display).toBe('main');
      expect(getState(store).surfaces['ui-2'].display).toBe('inline');
    });
  });

  describe('updateSurfaceState', () => {
    it('replaces the whole data model when path is "/"', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'red shirt', products: []},
        })
      );

      store.dispatch(
        actions.updateSurfaceState({
          surfaceId: 'ui-1',
          path: '/',
          value: {query: 'red shirt', products: [{name: 'Shirt'}]},
        })
      );

      expect(getState(store).surfaces['ui-1'].state).toEqual({
        query: 'red shirt',
        products: [{name: 'Shirt'}],
      });
    });

    it('patches a top-level key by path, leaving others intact', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'red shirt', products: [], facets: []},
        })
      );

      store.dispatch(
        actions.updateSurfaceState({
          surfaceId: 'ui-1',
          path: '/products',
          value: [{name: 'Shirt'}],
        })
      );

      expect(getState(store).surfaces['ui-1'].state).toEqual({
        query: 'red shirt',
        products: [{name: 'Shirt'}],
        facets: [],
      });
    });

    it('creates a surface when patching a non-existent entry (upsert)', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.updateSurfaceState({
          surfaceId: 'non-existent',
          path: '/',
          value: {query: 'hello'},
        })
      );

      expect(getState(store).surfaces['non-existent']).toEqual({
        type: 'product_search',
        display: 'main',
        state: {query: 'hello'},
      });
    });
  });

  describe('deleteSurface', () => {
    it('removes the surface entry', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createSurface({
          surfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'shoes'},
        })
      );

      store.dispatch(actions.deleteSurface({surfaceId: 'ui-1'}));

      expect(getState(store).surfaces['ui-1']).toBeUndefined();
    });
  });

  describe('setSuggestions', () => {
    it('stores suggestions for a surface', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.setSuggestions({
          surfaceId: 'ui-1',
          suggestions: {
            query: 'red',
            completions: [
              {expression: 'red shirt', highlighted: '<b>red</b> shirt'},
            ],
            products: [{name: 'Red Shirt'}],
          },
        })
      );

      expect(getState(store).suggestions['ui-1']).toEqual({
        query: 'red',
        completions: [
          {expression: 'red shirt', highlighted: '<b>red</b> shirt'},
        ],
        products: [{name: 'Red Shirt'}],
      });
    });
  });

  describe('facetSearchResults', () => {
    it('setFacetSearchResults stores results keyed by facetId', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.setFacetSearchResults({
          surfaceId: 'ui-1',
          results: {
            facetId: 'brand',
            query: 'Ni',
            values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
            moreValuesAvailable: false,
          },
        })
      );

      expect(getState(store).facetSearchResults['brand']).toEqual({
        facetId: 'brand',
        query: 'Ni',
        values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
        moreValuesAvailable: false,
      });
    });

    it('updateSurfaceState clears all facetSearchResults', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.setFacetSearchResults({
          surfaceId: 'ui-1',
          results: {
            facetId: 'brand',
            query: 'Ni',
            values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
            moreValuesAvailable: false,
          },
        })
      );

      store.dispatch(
        actions.updateSurfaceState({
          surfaceId: 'ui-1',
          path: '/',
          value: {query: 'shoes', products: []},
        })
      );

      expect(getState(store).facetSearchResults).toEqual({});
    });

    it('clearFacetSearchResults resets to empty', () => {
      const store = createStore();
      const actions = getOrCreateBackendSurfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.setFacetSearchResults({
          surfaceId: 'ui-1',
          results: {
            facetId: 'brand',
            query: 'Ni',
            values: [{displayValue: 'Nike', rawValue: 'Nike', count: 42}],
            moreValuesAvailable: false,
          },
        })
      );

      store.dispatch(actions.clearFacetSearchResults({surfaceId: 'ui-1'}));

      expect(getState(store).facetSearchResults).toEqual({});
    });
  });
});
