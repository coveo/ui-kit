import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  findComponentContract,
  type RemoteControllerSource,
  type ComponentType,
} from './remote-controller.js';
import {ComponentContractsSchema} from '@coveo/thermidor-schema';

const componentTypes: ComponentType[] = ComponentContractsSchema.options.map(
  (opt) => opt.shape.componentType.value
);

function createSource(snapshot: Record<string, unknown>) {
  const listeners = new Set<() => void>();
  const source = {
    state: {activeTurn: {agentResponse: {state: snapshot}}},
    dispatchAction: vi.fn().mockResolvedValue(undefined),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSnapshot(nextSnapshot: Record<string, unknown>) {
      source.state = {activeTurn: {agentResponse: {state: nextSnapshot}}};
      listeners.forEach((listener) => listener());
    },
  };
  return source as unknown as RemoteControllerSource & {
    dispatchAction: ReturnType<typeof vi.fn>;
    setSnapshot(snapshot: Record<string, unknown>): void;
  };
}

describe('remote-controller property tests', () => {
  /**
   * **Validates: Requirements 10.1**
   *
   * Property 1: Schema round-trip preservation.
   * For each valid component contract instance (one per componentType), parsing with
   * ComponentContractsSchema and serializing back produces a deep-equal object.
   */
  describe('Property 1: Schema round-trip preservation', () => {
    const minimalInstances: Record<ComponentType, unknown> = {
      'product-carousel': {
        componentType: 'product-carousel',
        state: {products: []},
        actions: {},
      },
      cart: {
        componentType: 'cart',
        state: {items: []},
        actions: {
          setItems: {payload: {items: []}},
          updateItemQuantity: {
            payload: {item: {productId: 'p1', name: 'Widget', price: 5, quantity: 1}},
          },
        },
      },
      'next-actions-bar': {
        componentType: 'next-actions-bar',
        state: {actions: []},
        actions: {
          selectAction: {payload: {text: 'hello', type: 'followup'}},
        },
      },
      'bundle-display': {
        componentType: 'bundle-display',
        state: {tiers: []},
        actions: {},
      },
      'comparison-table': {
        componentType: 'comparison-table',
        state: {attributes: [], products: []},
        actions: {},
      },
      'product-list': {
        componentType: 'product-list',
        state: {products: []},
        actions: {},
      },
      pagination: {
        componentType: 'pagination',
        state: {page: 0, pageSize: 10, totalEntries: 0, totalPages: 0},
        actions: {
          selectPage: {payload: {page: 0}},
          setPageSize: {payload: {pageSize: 10}},
        },
      },
      sort: {
        componentType: 'sort',
        state: {
          appliedSort: {sortCriteria: 'relevance', fields: []},
          availableSorts: [{sortCriteria: 'relevance', fields: []}],
        },
        actions: {
          setSort: {payload: {sortCriteria: 'relevance', fields: []}},
        },
      },
      'search-box': {
        componentType: 'search-box',
        state: {query: ''},
        actions: {
          submitQuery: {payload: {query: ''}},
        },
      },
    };

    it.each(componentTypes)('round-trip preservation for %s', (componentType) => {
      const instance = minimalInstances[componentType];
      const parsed = ComponentContractsSchema.parse(instance);
      const roundTripped = JSON.parse(JSON.stringify(parsed));
      expect(roundTripped).toEqual(parsed);
    });
  });

  /**
   * **Validates: Requirements 6.2, 8.2**
   *
   * Property 3: Component contract resolution.
   * For every componentType in the union, findComponentContract(componentType) returns
   * a unique matching entry with state and actions shapes.
   */
  describe('Property 3: Component contract resolution', () => {
    it.each(componentTypes)('findComponentContract resolves %s', (componentType) => {
      const contract = findComponentContract(componentType);
      expect(contract.shape.componentType.value).toBe(componentType);
      expect(contract.shape.state).toBeDefined();
      expect(contract.shape.actions).toBeDefined();
    });

    it('each componentType resolves to a unique contract', () => {
      const contracts = componentTypes.map((ct) => findComponentContract(ct));
      const uniqueContracts = new Set(contracts);
      expect(uniqueContracts.size).toBe(componentTypes.length);
    });
  });

  /**
   * **Validates: Requirements 7.1, 7.4**
   *
   * Property 4: State selector isolation.
   * For any two distinct componentIds in a snapshot, selectRemoteControllerState
   * returns the correct isolated slice.
   */
  describe('Property 4: State selector isolation', () => {
    it('isolates state between different componentIds', () => {
      const state = {
        activeTurn: {
          agentResponse: {
            state: {
              components: {
                'comp-a': {value: 'A'},
                'comp-b': {value: 'B'},
              },
            },
          },
        },
      };
      expect(selectRemoteControllerState(state as never, 'comp-a')).toEqual({value: 'A'});
      expect(selectRemoteControllerState(state as never, 'comp-b')).toEqual({value: 'B'});
    });

    it('does not leak state between components', () => {
      const state = {
        activeTurn: {
          agentResponse: {
            state: {
              components: {
                'cart-1': {items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}]},
                'cart-2': {items: [{productId: 'p2', name: 'B', price: 2, quantity: 2}]},
              },
            },
          },
        },
      };
      const slice1 = selectRemoteControllerState(state as never, 'cart-1');
      const slice2 = selectRemoteControllerState(state as never, 'cart-2');
      expect(slice1).not.toEqual(slice2);
      expect(slice1).toEqual({items: [{productId: 'p1', name: 'A', price: 1, quantity: 1}]});
      expect(slice2).toEqual({items: [{productId: 'p2', name: 'B', price: 2, quantity: 2}]});
    });
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * Property 5: Empty state singleton identity.
   * For any source without a components key or entry, selectRemoteControllerState
   * returns the same singleton reference.
   */
  describe('Property 5: Empty state singleton identity', () => {
    it('returns the same singleton reference for missing state', () => {
      const emptyState = {activeTurn: {agentResponse: {state: {}}}};
      const noComponents = {activeTurn: {agentResponse: {state: {components: {}}}}};
      const result1 = selectRemoteControllerState(emptyState as never, 'a');
      const result2 = selectRemoteControllerState(noComponents as never, 'b');
      const result3 = selectRemoteControllerState(emptyState as never, 'c');
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('returns the singleton for null/undefined snapshots', () => {
      const noTurn = {activeTurn: undefined};
      const noResponse = {activeTurn: {agentResponse: undefined}};
      const result1 = selectRemoteControllerState(noTurn as never, 'x');
      const result2 = selectRemoteControllerState(noResponse as never, 'y');
      expect(result1).toBe(result2);
    });
  });

  /**
   * **Validates: Requirements 7.2, 9.3**
   *
   * Property 6: Action dispatch payload round-trip.
   * For a valid action payload, dispatch invokes source.dispatchAction with
   * matching {componentId, componentType, action, payload}.
   */
  describe('Property 6: Action dispatch payload round-trip', () => {
    it('dispatches with correct {componentId, componentType, action, payload}', async () => {
      const source = createSource({components: {'my-cart': {items: []}}});
      const controller = buildRemoteController({
        source,
        componentId: 'my-cart',
        componentType: 'cart',
      });
      const payload = {item: {productId: 'p1', name: 'Widget', price: 5, quantity: 1}};
      await controller.dispatch('updateItemQuantity', payload);
      expect(source.dispatchAction).toHaveBeenCalledWith({
        componentId: 'my-cart',
        componentType: 'cart',
        action: 'updateItemQuantity',
        payload,
      });
    });

    it('dispatches setItems with the correct payload structure', async () => {
      const source = createSource({components: {'my-cart': {items: []}}});
      const controller = buildRemoteController({
        source,
        componentId: 'my-cart',
        componentType: 'cart',
      });
      const payload = {items: [{productId: 'p1', name: 'Widget', price: 10, quantity: 3}]};
      await controller.dispatch('setItems', payload);
      expect(source.dispatchAction).toHaveBeenCalledWith({
        componentId: 'my-cart',
        componentType: 'cart',
        action: 'setItems',
        payload,
      });
    });
  });

  /**
   * **Validates: Requirements 6.4, 9.6**
   *
   * Property 7: Invalid payload rejection.
   * For invalid payloads, dispatch rejects and does NOT call source.dispatchAction.
   */
  describe('Property 7: Invalid payload rejection', () => {
    it('rejects invalid payload without calling dispatchAction', async () => {
      const source = createSource({components: {'my-cart': {items: []}}});
      const controller = buildRemoteController({
        source,
        componentId: 'my-cart',
        componentType: 'cart',
      });
      await expect(
        controller.dispatch('updateItemQuantity', {
          item: {productId: 'p1', name: 'X', price: -1, quantity: 0},
        } as any)
      ).rejects.toThrow();
      expect(source.dispatchAction).not.toHaveBeenCalled();
    });

    it('rejects when required payload fields are missing', async () => {
      const source = createSource({components: {'my-cart': {items: []}}});
      const controller = buildRemoteController({
        source,
        componentId: 'my-cart',
        componentType: 'cart',
      });
      await expect(controller.dispatch('updateItemQuantity', {} as any)).rejects.toThrow();
      expect(source.dispatchAction).not.toHaveBeenCalled();
    });
  });
});
