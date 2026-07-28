import {describe, expect, it, vi} from 'vitest';
import {cartControllerContract} from '@coveo/thermidor-contracts';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from './remote-controller.js';

const cartContract = cartControllerContract.shape.schemaId.value;
const cartItem = {productId: 'p1', name: 'Product', price: 10, quantity: 2};

describe('buildRemoteController', () => {
  it('selects its server-owned state from the active conversation turn', () => {
    const source = createSource({controllers: {cart: {items: [cartItem]}}});
    const controller = buildRemoteController({
      source,
      controllerId: 'cart',
      contract: cartContract,
    });

    expect(controller.state).toEqual({items: [cartItem]});
  });

  it('notifies subscribers when its snapshot slice changes, but not for another controller', () => {
    const cart = {items: []};
    const source = createSource({controllers: {cart, products: {products: []}}});
    const controller = buildRemoteController({
      source,
      controllerId: 'cart',
      contract: cartContract,
    });
    const callback = vi.fn();

    controller.subscribe(callback);
    source.setSnapshot({controllers: {cart, products: {products: ['p1']}}});
    expect(callback).not.toHaveBeenCalled();

    source.setSnapshot({controllers: {cart: {items: [cartItem]}}});
    expect(callback).toHaveBeenCalledWith({items: [cartItem]});
  });

  it('dispatches schema-derived actions without locally changing server-owned state', async () => {
    const source = createSource({controllers: {cart: {items: []}}});
    const controller = buildRemoteController({
      source,
      controllerId: 'cart',
      contract: cartContract,
    });

    await controller.dispatch('updateItemQuantity', {item: cartItem});

    expect(source.dispatchAction).toHaveBeenCalledWith({
      controllerId: 'cart',
      controllerSchema: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
      action: 'updateItemQuantity',
      payload: {item: cartItem},
    });
    expect(controller.state).toEqual({items: []});
  });

  it('returns undefined for an invalid snapshot and rejects an invalid action payload', async () => {
    const controller = buildRemoteController({
      source: createSource({controllers: {cart: {items: 'invalid'}}}),
      controllerId: 'cart',
      contract: cartContract,
    });

    expect(controller.state).toBeUndefined();
    await expect(
      controller.dispatch('updateItemQuantity', {item: {...cartItem, quantity: 0}})
    ).rejects.toThrow('Invalid payload');
  });
});

describe('selectRemoteControllerState', () => {
  it('returns the stable empty state when no matching snapshot entry exists', () => {
    const state = {activeTurn: {agentResponse: {state: {controllers: {}}}}};

    expect(selectRemoteControllerState(state as never, 'missing')).toEqual({});
  });
});

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
