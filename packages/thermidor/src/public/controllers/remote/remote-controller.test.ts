import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from './remote-controller.js';

const cartItem = {productId: 'p1', name: 'Product', price: 10, quantity: 2};

describe('buildRemoteController', () => {
  it('selects its server-owned state from state.components[componentId]', () => {
    const source = createSource({components: {cart: {items: [cartItem]}}});
    const controller = buildRemoteController({
      source,
      componentId: 'cart',
      componentType: 'cart',
    });

    expect(controller.state).toEqual({items: [cartItem]});
  });

  it('throws for unknown componentType', () => {
    const source = createSource({components: {}});
    expect(() =>
      buildRemoteController({
        source,
        componentId: 'x',
        componentType: 'unknown-type' as any,
      })
    ).toThrow('Unknown component contract');
  });

  it('notifies subscribers when its component slice changes, but not for another component', () => {
    const cart = {items: []};
    const source = createSource({components: {cart, products: {products: []}}});
    const controller = buildRemoteController({
      source,
      componentId: 'cart',
      componentType: 'cart',
    });
    const callback = vi.fn();

    controller.subscribe(callback);
    source.setSnapshot({components: {cart, products: {products: ['p1']}}});
    expect(callback).not.toHaveBeenCalled();

    source.setSnapshot({components: {cart: {items: [cartItem]}}});
    expect(callback).toHaveBeenCalledWith({items: [cartItem]});
  });

  it('dispatches actions with {componentId, componentType, action, payload}', async () => {
    const source = createSource({components: {cart: {items: []}}});
    const controller = buildRemoteController({
      source,
      componentId: 'cart',
      componentType: 'cart',
    });

    await controller.dispatch('updateItemQuantity', {item: cartItem});

    expect(source.dispatchAction).toHaveBeenCalledWith({
      componentId: 'cart',
      componentType: 'cart',
      action: 'updateItemQuantity',
      payload: {item: cartItem},
    });
    expect(controller.state).toEqual({items: []});
  });

  it('returns undefined for invalid state and rejects invalid action payload', async () => {
    const controller = buildRemoteController({
      source: createSource({components: {cart: {items: 'invalid'}}}),
      componentId: 'cart',
      componentType: 'cart',
    });

    expect(controller.state).toBeUndefined();
    await expect(
      controller.dispatch('updateItemQuantity', {item: {...cartItem, quantity: 0}})
    ).rejects.toThrow('Invalid payload');
  });

  it('exposes componentId as a readonly property', () => {
    const source = createSource({components: {}});
    const controller = buildRemoteController({
      source,
      componentId: 'my-cart',
      componentType: 'cart',
    });
    expect(controller.componentId).toBe('my-cart');
  });
});

describe('selectRemoteControllerState', () => {
  it('returns the stable singleton empty object when no matching component entry exists', () => {
    const state = {activeTurn: {agentResponse: {state: {components: {}}}}};
    const result1 = selectRemoteControllerState(state as never, 'missing');
    const result2 = selectRemoteControllerState(state as never, 'also-missing');

    expect(result1).toEqual({});
    expect(result1).toBe(result2);
  });

  it('returns the stable singleton when components key is missing', () => {
    const state = {activeTurn: {agentResponse: {state: {}}}};
    const result = selectRemoteControllerState(state as never, 'anything');
    expect(result).toEqual({});
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
