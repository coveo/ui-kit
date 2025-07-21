import {renderHook} from '@testing-library/react';
import {describe, expect, it, test, vi} from 'vitest';
import {useSyncMemoizedStore} from './client-utils.js';

describe('useSyncMemoizedStore', () => {
  test('should return the initial snapshot', () => {
    const snapshot = {count: 0};
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);
    const getSnapshot = vi.fn(() => snapshot);

    const {result} = renderHook(() =>
      useSyncMemoizedStore(subscribe, getSnapshot)
    );

    expect(result.current).toEqual(snapshot);
  });

  test('should not call getSnapshot when there is a re-render with the same getSnapshot', () => {
    const snapshot = {count: 0};
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);
    const getSnapshot = vi.fn(() => snapshot);

    const {rerender} = renderHook(() =>
      useSyncMemoizedStore(subscribe, getSnapshot)
    );

    expect(getSnapshot).toHaveBeenCalledTimes(1);
    rerender();
    expect(getSnapshot).toHaveBeenCalledTimes(1);
  });

  test('should update the state when getSnapshot changes', () => {
    const snapshot1 = {count: 0};
    const snapshot2 = {count: 1};
    const subscribe = vi.fn(() => vi.fn());
    let getSnapshot = vi.fn(() => snapshot1);

    const {result, rerender} = renderHook(() =>
      useSyncMemoizedStore(subscribe, getSnapshot)
    );

    expect(result.current).toEqual(snapshot1);
    getSnapshot = vi.fn(() => snapshot2);
    rerender();
    expect(result.current).toEqual(snapshot2);
  });

  test('should unsubscribe and re-subscribe to new function when subscribe function is changed', () => {
    const snapshot = {count: 0};
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();
    const subscribe1 = vi.fn(() => unsubscribe1);
    const subscribe2 = vi.fn(() => unsubscribe2);
    const getSnapshot = vi.fn(() => snapshot);

    const {rerender} = renderHook(
      ({subscribe}) => useSyncMemoizedStore(subscribe, getSnapshot),
      {initialProps: {subscribe: subscribe1}}
    );

    expect(subscribe1).toHaveBeenCalledTimes(1);
    expect(unsubscribe1).not.toHaveBeenCalled();
    expect(subscribe2).not.toHaveBeenCalled();

    rerender({subscribe: subscribe2});
    expect(unsubscribe1).toHaveBeenCalledTimes(1);
    expect(subscribe2).toHaveBeenCalledTimes(1);
    expect(unsubscribe2).not.toHaveBeenCalled();
  });
  test('should replace current snapshot when getSnapshot function is changed', () => {
    const snapshot1 = {count: 0};
    const snapshot2 = {count: 1};
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);
    const getSnapshot1 = vi.fn(() => snapshot1);
    const getSnapshot2 = vi.fn(() => snapshot2);

    const {result, rerender} = renderHook(
      ({getSnapshot}) => useSyncMemoizedStore(subscribe, getSnapshot),
      {initialProps: {getSnapshot: getSnapshot1}}
    );

    expect(result.current).toEqual(snapshot1);
    rerender({getSnapshot: getSnapshot2});
    expect(result.current).toEqual(snapshot2);
  });

  it('should call the subscribe listener on mount and unsubscribe on unmount', () => {
    const snapshot = {count: 0};
    const unsubscribe = vi.fn();
    const listener = vi.fn();
    const subscribe = vi.fn(() => {
      listener();
      return unsubscribe;
    });
    const getSnapshot = vi.fn(() => snapshot);

    const {result, unmount} = renderHook(() => {
      return useSyncMemoizedStore(subscribe, getSnapshot);
    });

    expect(result.current).toEqual(snapshot);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
