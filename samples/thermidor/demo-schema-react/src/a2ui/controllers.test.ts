import {describe, expect, it, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import type {RemoteController} from '@coveo/thermidor';
import {useRemoteController} from './controllers.js';

const mockRemoteController = vi.fn();

vi.mock('../context/session.js', () => ({
  useSession: () => ({
    remoteController: mockRemoteController,
  }),
}));

/**
 * Builds a fake {@link RemoteController} matching the shape the sample's
 * `useRemoteController` hook consumes: a `state` snapshot, a `subscribe` seam,
 * and a `dispatch` method.
 */
function fakeController(state: unknown): RemoteController<never, never> {
  return {
    componentId: 'component-under-test',
    state,
    subscribe: () => () => undefined,
    dispatch: vi.fn().mockResolvedValue(undefined),
  } as unknown as RemoteController<never, never>;
}

describe('useRemoteController', () => {
  beforeEach(() => {
    mockRemoteController.mockReset();
  });

  it('vends a controller from the session for the given componentId and componentType', () => {
    const controller = fakeController({products: [{permanentid: 'p1'}]});
    mockRemoteController.mockReturnValue(controller);

    const {result} = renderHook(() => useRemoteController('featured-products', 'product-list'));

    expect(mockRemoteController).toHaveBeenCalledWith('featured-products', 'product-list');
    expect(result.current).toBe(controller);
    expect(result.current.state).toEqual({products: [{permanentid: 'p1'}]});
  });

  it('exposes the controller dispatch so consumers forward validated actions', async () => {
    const controller = fakeController({pageSize: 12});
    mockRemoteController.mockReturnValue(controller);

    const {result} = renderHook(() => useRemoteController('page-size', 'page-size'));

    await result.current.dispatch('setPageSize', {pageSize: 24});

    expect(controller.dispatch).toHaveBeenCalledWith('setPageSize', {pageSize: 24});
  });
});
