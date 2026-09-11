import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from './remote-controller.js';

const facetState = {
  field: 'price',
  displayName: 'Price',
  values: [],
  customRange: null,
  hasActiveValues: false,
  canShowMoreValues: false,
  canShowLessValues: false,
};

describe('buildRemoteController', () => {
  it('selects its server-owned state from state.components[componentId]', () => {
    const source = createSource({components: {'price-facet': facetState}});
    const controller = buildRemoteController({
      source,
      componentId: 'price-facet',
      componentType: 'numeric-facet',
    });

    expect(controller.state).toEqual(facetState);
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
    const source = createSource({
      components: {'price-facet': facetState, products: {products: []}},
    });
    const controller = buildRemoteController({
      source,
      componentId: 'price-facet',
      componentType: 'numeric-facet',
    });
    const callback = vi.fn();

    controller.subscribe(callback);
    source.setSnapshot({components: {'price-facet': facetState, products: {products: ['p1']}}});
    expect(callback).not.toHaveBeenCalled();

    const nextState = {...facetState, hasActiveValues: true};
    source.setSnapshot({components: {'price-facet': nextState}});
    expect(callback).toHaveBeenCalledWith(nextState);
  });

  it('dispatches actions with {componentId, componentType, action, payload}', async () => {
    const source = createSource({components: {'price-facet': facetState}});
    const controller = buildRemoteController({
      source,
      componentId: 'price-facet',
      componentType: 'numeric-facet',
    });

    await controller.dispatch('applyCustomRange', {start: 0, end: 100});

    expect(source.dispatchAction).toHaveBeenCalledWith({
      componentId: 'price-facet',
      componentType: 'numeric-facet',
      action: 'applyCustomRange',
      payload: {start: 0, end: 100},
    });
    expect(controller.state).toEqual(facetState);
  });

  it('returns undefined for invalid state and rejects invalid action payload', async () => {
    const controller = buildRemoteController({
      source: createSource({components: {'price-facet': {...facetState, values: 'invalid'}}}),
      componentId: 'price-facet',
      componentType: 'numeric-facet',
    });

    expect(controller.state).toBeUndefined();
    await expect(
      controller.dispatch('applyCustomRange', {start: 0, end: 100, unexpected: true} as never)
    ).rejects.toThrow('Invalid payload');
  });

  it('exposes componentId as a readonly property', () => {
    const source = createSource({components: {}});
    const controller = buildRemoteController({
      source,
      componentId: 'my-facet',
      componentType: 'numeric-facet',
    });
    expect(controller.componentId).toBe('my-facet');
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
