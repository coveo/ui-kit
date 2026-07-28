import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from '@coveo/thermidor';
import {cartControllerContract, type CartController} from '@coveo/thermidor-contracts';

describe('selectRemoteControllerState', () => {
  it('selects the advertised controller slice from the active Thermidor turn', () => {
    const state = {
      activeTurn: {
        agentResponse: {
          state: {controllers: {'featured-products': {products: [{permanentid: 'p1'}]}}},
        },
      },
    } as unknown as Parameters<typeof selectRemoteControllerState>[0];

    expect(selectRemoteControllerState(state, 'featured-products')).toEqual({
      products: [{permanentid: 'p1'}],
    });
    expect(selectRemoteControllerState(state, 'unknown-controller')).toEqual({});
  });

  it('defines CartController as an inferred Zod contract object', () => {
    const contract: CartController = {
      schemaId: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
      state: {items: []},
      setItems: {items: []},
      updateItemQuantity: {
        item: {productId: 'p1', name: 'Product', price: 10, quantity: 2},
      },
    };

    expect(cartControllerContract.parse(contract)).toEqual(contract);
  });

  it('builds a remote controller from the advertised CartController schema ID', async () => {
    const dispatchAction = vi.fn();
    const source = {
      state: {
        activeTurn: {agentResponse: {state: {controllers: {'shopping-cart': {items: []}}}}},
      },
      subscribe: () => () => undefined,
      dispatchAction,
    } as unknown as RemoteControllerSource;
    const controller = buildRemoteController({
      source,
      controllerId: 'shopping-cart',
      contract: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
    });

    await controller.dispatch('updateItemQuantity', {
      item: {productId: 'p1', name: 'Product', price: 10, quantity: 2},
    });

    expect(dispatchAction).toHaveBeenCalledWith({
      controllerId: 'shopping-cart',
      controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
      action: 'updateItemQuantity',
      payload: {item: {productId: 'p1', name: 'Product', price: 10, quantity: 2}},
    });
  });
});
