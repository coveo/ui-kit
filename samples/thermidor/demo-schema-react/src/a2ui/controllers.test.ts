import {describe, expect, it, vi} from 'vitest';
import {
  buildRemoteController,
  selectRemoteControllerState,
  type RemoteControllerSource,
} from '@coveo/thermidor';

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

  it('builds a remote controller from componentType and dispatches correctly', async () => {
    const dispatchAction = vi.fn();
    const source = {
      state: {
        activeTurn: {agentResponse: {state: {components: {'page-size': {pageSize: 12}}}}},
      },
      subscribe: () => () => undefined,
      dispatchAction,
    } as unknown as RemoteControllerSource;
    const controller = buildRemoteController({
      source,
      componentId: 'page-size',
      componentType: 'page-size',
    });

    await controller.dispatch('setPageSize', {pageSize: 24});

    expect(dispatchAction).toHaveBeenCalledWith({
      componentId: 'page-size',
      componentType: 'page-size',
      action: 'setPageSize',
      payload: {pageSize: 24},
    });
  });
});
