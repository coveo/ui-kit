import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useAutoScroll} from './use-auto-scroll.js';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => cb());
});

function createMockContainer(overrides: Partial<HTMLDivElement> = {}) {
  return {
    clientHeight: 800,
    offsetTop: 0,
    scrollHeight: 1000,
    scrollTo: vi.fn(),
    style: {paddingBottom: ''},
    ...overrides,
  } as unknown as HTMLDivElement;
}

function createMockTurnElement(overrides: Partial<HTMLDivElement> = {}): HTMLDivElement {
  return {
    offsetHeight: 60,
    offsetTop: 100,
    ...overrides,
  } as unknown as HTMLDivElement;
}

describe('useAutoScroll', () => {
  it('scrolls to the latest turn when turns array grows', () => {
    const container = createMockContainer();
    const turnElement = createMockTurnElement();
    const containerRef = {current: container};
    const turnRefs = {current: new Map([['turn-1', turnElement]])};

    renderHook(() =>
      useAutoScroll({
        containerRef,
        turnRefs,
        turns: [{id: 'turn-1', prompt: 'hello', status: 'complete'}],
        isStreaming: false,
      })
    );

    expect(container.scrollTo).toHaveBeenCalledWith({
      top: 80,
      behavior: 'smooth',
    });
    expect(container.style.paddingBottom).toBe('720px');
  });

  it('does not scroll when turns array is empty', () => {
    const container = createMockContainer();
    const containerRef = {current: container};
    const turnRefs = {current: new Map<string, HTMLDivElement>()};

    renderHook(() =>
      useAutoScroll({
        containerRef,
        turnRefs,
        turns: [],
        isStreaming: false,
      })
    );

    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('calculates padding as containerHeight - bubbleHeight - MARGIN_TOP', () => {
    const container = createMockContainer({clientHeight: 500} as Partial<HTMLDivElement>);
    const turnElement = createMockTurnElement({offsetHeight: 100} as Partial<HTMLDivElement>);
    const containerRef = {current: container};
    const turnRefs = {current: new Map([['turn-1', turnElement]])};

    renderHook(() =>
      useAutoScroll({
        containerRef,
        turnRefs,
        turns: [{id: 'turn-1', prompt: 'hello', status: 'complete'}],
        isStreaming: false,
      })
    );

    expect(container.style.paddingBottom).toBe('380px');
  });

  it('clamps padding to 0 when bubble is taller than container', () => {
    const container = createMockContainer({clientHeight: 50} as Partial<HTMLDivElement>);
    const turnElement = createMockTurnElement({offsetHeight: 100} as Partial<HTMLDivElement>);
    const containerRef = {current: container};
    const turnRefs = {current: new Map([['turn-1', turnElement]])};

    renderHook(() =>
      useAutoScroll({
        containerRef,
        turnRefs,
        turns: [{id: 'turn-1', prompt: 'hello', status: 'complete'}],
        isStreaming: false,
      })
    );

    expect(container.style.paddingBottom).toBe('0px');
  });
});
