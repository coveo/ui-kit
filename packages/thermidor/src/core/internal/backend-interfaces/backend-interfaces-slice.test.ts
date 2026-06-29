import {describe, expect, it} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';
import {getOrCreateBackendInterfacesActions} from './backend-interfaces-actions.js';
import {
  createBackendInterfacesSlice,
  initialBackendInterfacesState,
} from './backend-interfaces-slice.js';

const INTERFACE_ID = 'test-iface';

function createStore() {
  const slice = createBackendInterfacesSlice(INTERFACE_ID);
  return configureStore({reducer: {[slice.name]: slice.reducer}});
}

function getState(store: ReturnType<typeof createStore>) {
  return store.getState()[`${INTERFACE_ID}/backendInterfaces`];
}

describe('backendInterfacesSlice', () => {
  it('has correct initial state', () => {
    const store = createStore();
    expect(getState(store)).toEqual(initialBackendInterfacesState);
  });

  describe('createInterface', () => {
    it('adds a new interface entry', () => {
      const store = createStore();
      const actions = getOrCreateBackendInterfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createInterface({
          interfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'red shirt', products: []},
        })
      );

      expect(getState(store).interfaces['ui-1']).toEqual({
        type: 'product_search',
        display: 'main',
        state: {query: 'red shirt', products: []},
      });
    });
  });

  describe('updateInterfaceState', () => {
    it('updates state of existing interface', () => {
      const store = createStore();
      const actions = getOrCreateBackendInterfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createInterface({
          interfaceId: 'ui-1',
          type: 'product_search',
          display: 'main',
          state: {query: 'red shirt', products: []},
        })
      );

      store.dispatch(
        actions.updateInterfaceState({
          interfaceId: 'ui-1',
          state: {query: 'red shirt', products: [{name: 'Shirt'}]},
        })
      );

      expect(getState(store).interfaces['ui-1'].state).toEqual({
        query: 'red shirt',
        products: [{name: 'Shirt'}],
      });
    });

    it('updates display when provided', () => {
      const store = createStore();
      const actions = getOrCreateBackendInterfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.createInterface({
          interfaceId: 'ui-1',
          type: 'product_search',
          display: 'inline',
          state: {},
        })
      );

      store.dispatch(
        actions.updateInterfaceState({
          interfaceId: 'ui-1',
          state: {},
          display: 'main',
        })
      );

      expect(getState(store).interfaces['ui-1'].display).toBe('main');
    });

    it('does not modify non-existent interfaces', () => {
      const store = createStore();
      const actions = getOrCreateBackendInterfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.updateInterfaceState({
          interfaceId: 'non-existent',
          state: {query: 'hello'},
        })
      );

      expect(getState(store).interfaces['non-existent']).toBeUndefined();
    });
  });

  describe('setSuggestions', () => {
    it('stores suggestions for an interface', () => {
      const store = createStore();
      const actions = getOrCreateBackendInterfacesActions(INTERFACE_ID);

      store.dispatch(
        actions.setSuggestions({
          interfaceId: 'ui-1',
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
});
