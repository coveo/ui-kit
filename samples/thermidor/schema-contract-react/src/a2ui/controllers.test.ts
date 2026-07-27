import {describe, expect, it} from 'vitest';
import {selectRemoteControllerState} from '@coveo/thermidor';

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
});
