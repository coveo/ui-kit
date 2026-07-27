import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from './remote-controller.js';

describe('buildRemoteController', () => {
  it('selects its server-owned state from the active conversation turn', () => {
    const source = createSource({controllers: {cart: {items: [{productId: 'p1'}]}}});
    const controller = buildRemoteController({
      source,
      controllerId: 'cart',
      dispatchAction: vi.fn(),
    });

    expect(controller.state).toEqual({items: [{productId: 'p1'}]});
  });

  it('notifies subscribers when its snapshot slice changes, but not for another controller', () => {
    const source = createSource({controllers: {cart: {items: []}, products: {products: []}}});
    const controller = buildRemoteController({
      source,
      controllerId: 'cart',
      dispatchAction: vi.fn(),
    });
    const callback = vi.fn();

    controller.subscribe(callback);
    source.setSnapshot({controllers: {cart: controller.state, products: {products: ['p1']}}});
    expect(callback).not.toHaveBeenCalled();

    source.setSnapshot({controllers: {cart: {items: [{productId: 'p1'}]}}});
    expect(callback).toHaveBeenCalledWith({items: [{productId: 'p1'}]});
  });

  it('dispatches controller actions without locally changing server-owned state', async () => {
    const dispatchAction = vi.fn();
    const controller = buildRemoteController({
      source: createSource({controllers: {cart: {items: []}}}),
      controllerId: 'cart',
      dispatchAction,
    });

    await controller.dispatch('updateItemQuantity', {item: {productId: 'p1', quantity: 2}});

    expect(dispatchAction).toHaveBeenCalledWith({
      controllerId: 'cart',
      action: 'updateItemQuantity',
      payload: {item: {productId: 'p1', quantity: 2}},
    });
    expect(controller.state).toEqual({items: []});
  });

  it('rejects an unnamed action', async () => {
    const controller = buildRemoteController({
      source: createSource({controllers: {}}),
      controllerId: 'cart',
      dispatchAction: vi.fn(),
    });

    await expect(controller.dispatch('  ', {})).rejects.toThrow('action name is required');
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
    setSnapshot(snapshot: Record<string, unknown>): void;
  };
}
