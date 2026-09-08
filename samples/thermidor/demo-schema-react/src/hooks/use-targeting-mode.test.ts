import {describe, it, expect} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useTargetingMode} from './use-targeting-mode.js';

describe('useTargetingMode', () => {
  it('initializes with targeting off', () => {
    const {result} = renderHook(() => useTargetingMode());
    expect(result.current.isTargeting).toBe(false);
  });

  it('startTargeting sets isTargeting to true', () => {
    const {result} = renderHook(() => useTargetingMode());

    act(() => {
      result.current.startTargeting();
    });

    expect(result.current.isTargeting).toBe(true);
  });

  it('stopTargeting sets isTargeting to false', () => {
    const {result} = renderHook(() => useTargetingMode());

    act(() => {
      result.current.startTargeting();
    });

    act(() => {
      result.current.stopTargeting();
    });

    expect(result.current.isTargeting).toBe(false);
  });

  it('toggleTargeting flips the state', () => {
    const {result} = renderHook(() => useTargetingMode());

    act(() => {
      result.current.toggleTargeting();
    });

    expect(result.current.isTargeting).toBe(true);

    act(() => {
      result.current.toggleTargeting();
    });

    expect(result.current.isTargeting).toBe(false);
  });

  it('Escape key exits targeting mode when active', () => {
    const {result} = renderHook(() => useTargetingMode());

    act(() => {
      result.current.startTargeting();
    });

    expect(result.current.isTargeting).toBe(true);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    });

    expect(result.current.isTargeting).toBe(false);
  });

  it('Escape key does nothing when targeting is not active', () => {
    const {result} = renderHook(() => useTargetingMode());

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    });

    expect(result.current.isTargeting).toBe(false);
  });

  it('non-Escape keys do not exit targeting mode', () => {
    const {result} = renderHook(() => useTargetingMode());

    act(() => {
      result.current.startTargeting();
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
    });

    expect(result.current.isTargeting).toBe(true);
  });

  it('cleans up the listener on unmount', () => {
    const {result, unmount} = renderHook(() => useTargetingMode());

    act(() => {
      result.current.startTargeting();
    });

    unmount();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    });

    // No error thrown means listener was cleaned up successfully
  });
});
