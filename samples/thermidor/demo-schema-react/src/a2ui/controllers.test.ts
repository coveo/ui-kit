import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from '@coveo/thermidor';
import {CartSchema, ComponentContractsSchema} from '@coveo/thermidor-schema';

describe('selectRemoteControllerState', () => {
  it('selects state from components[componentId] in the active Thermidor turn', () => {
    const state = {
      activeTurn: {
        agentResponse: {
          state: {components: {'featured-products': {products: [{permanentid: 'p1'}]}}},
        },
      },
    } as unknown as Parameters<typeof selectRemoteControllerState>[0];

    expect(selectRemoteControllerState(state, 'featured-products')).toEqual({
      products: [{permanentid: 'p1'}],
    });
    expect(selectRemoteControllerState(state, 'unknown-component')).toEqual({});
  });

  it('validates Cart component contract with state and actions', () => {
    const cartItem = {productId: 'p1', name: 'Product', price: 10, quantity: 2};
    const contract = {
      componentType: 'cart',
      state: {items: [cartItem]},
      actions: {
        setItems: {payload: {items: [cartItem]}},
        updateItemQuantity: {payload: {item: cartItem}},
      },
    };

    expect(CartSchema.parse(contract)).toEqual(contract);
  });

  it('builds a remote controller from componentType and dispatches correctly', async () => {
    const dispatchAction = vi.fn();
    const source = {
      state: {
        activeTurn: {agentResponse: {state: {components: {'shopping-cart': {items: []}}}}},
      },
      subscribe: () => () => undefined,
      dispatchAction,
    } as unknown as RemoteControllerSource;
    const controller = buildRemoteController({
      source,
      componentId: 'shopping-cart',
      componentType: 'cart',
    });

    await controller.dispatch('updateItemQuantity', {
      item: {productId: 'p1', name: 'Product', price: 10, quantity: 2},
    });

    expect(dispatchAction).toHaveBeenCalledWith({
      componentId: 'shopping-cart',
      componentType: 'cart',
      action: 'updateItemQuantity',
      payload: {item: {productId: 'p1', name: 'Product', price: 10, quantity: 2}},
    });
  });
});
