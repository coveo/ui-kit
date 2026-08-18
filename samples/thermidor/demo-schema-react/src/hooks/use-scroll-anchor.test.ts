import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useScrollAnchor} from './use-scroll-anchor.js';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

function createMockContainer(overrides: Partial<HTMLDivElement> = {}) {
  return {
    clientHeight: 800,
    offsetTop: 0,
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

describe('useScrollAnchor', () => {
  describe('padding calculation logic', () => {
    it('calculates paddingBottom as containerHeight - bubbleHeight - MARGIN_TOP', () => {
      const container = createMockContainer();
      const turnElement = createMockTurnElement();
      const containerRef = {current: container};
      const turnRefs = {current: new Map([['turn-1', turnElement]])};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('turn-1');
      });

      expect(container.style.paddingBottom).toBe('720px');
    });

    it('clamps padding to 0 when bubble is taller than container minus margin', () => {
      const container = createMockContainer({
        clientHeight: 50,
      } as Partial<HTMLDivElement>);
      const turnElement = createMockTurnElement({
        offsetHeight: 100,
      } as Partial<HTMLDivElement>);
      const containerRef = {current: container};
      const turnRefs = {current: new Map([['turn-1', turnElement]])};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('turn-1');
      });

      expect(container.style.paddingBottom).toBe('0px');
    });
  });

  describe('scrollTo is called with correct offset', () => {
    it('calls scrollTo with elementOffset - container.offsetTop - MARGIN_TOP', () => {
      const container = createMockContainer();
      const turnElement = createMockTurnElement();
      const containerRef = {current: container};
      const turnRefs = {current: new Map([['turn-1', turnElement]])};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('turn-1');
      });

      expect(container.scrollTo).toHaveBeenCalledWith({
        top: 80,
        behavior: 'smooth',
      });
    });

    it('accounts for container offsetTop in scroll calculation', () => {
      const container = createMockContainer({
        offsetTop: 50,
      } as Partial<HTMLDivElement>);
      const turnElement = createMockTurnElement({
        offsetTop: 200,
      } as Partial<HTMLDivElement>);
      const containerRef = {current: container};
      const turnRefs = {current: new Map([['turn-1', turnElement]])};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('turn-1');
      });

      expect(container.scrollTo).toHaveBeenCalledWith({
        top: 130,
        behavior: 'smooth',
      });
    });

    it('does not call scrollTo when turn element is not found', () => {
      const container = createMockContainer();
      const containerRef = {current: container};
      const turnRefs = {current: new Map<string, HTMLDivElement>()};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('nonexistent-turn');
      });

      expect(container.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('recalculatePadding updates padding without scrolling', () => {
    it('updates paddingBottom without calling scrollTo after a previous scrollToPrompt', () => {
      const container = createMockContainer();
      const turnElement = createMockTurnElement();
      const containerRef = {current: container};
      const turnRefs = {current: new Map([['turn-1', turnElement]])};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('turn-1');
      });

      (container.scrollTo as ReturnType<typeof vi.fn>).mockClear();
      container.style.paddingBottom = '';

      act(() => {
        result.current.recalculatePadding();
      });

      expect(container.style.paddingBottom).toBe('720px');
      expect(container.scrollTo).not.toHaveBeenCalled();
    });

    it('does nothing when scrollToPrompt has never been called', () => {
      const container = createMockContainer();
      const containerRef = {current: container};
      const turnRefs = {current: new Map<string, HTMLDivElement>()};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.recalculatePadding();
      });

      expect(container.style.paddingBottom).toBe('');
      expect(container.scrollTo).not.toHaveBeenCalled();
    });

    it('recalculates using updated element dimensions', () => {
      const container = createMockContainer();
      const turnElement = createMockTurnElement();
      const containerRef = {current: container};
      const turnRefs = {current: new Map([['turn-1', turnElement]])};

      const {result} = renderHook(() => useScrollAnchor({containerRef, turnRefs, turns: [], isStreaming: false}));

      act(() => {
        result.current.scrollToPrompt('turn-1');
      });

      Object.defineProperty(turnElement, 'offsetHeight', {value: 200});
      (container.scrollTo as ReturnType<typeof vi.fn>).mockClear();

      act(() => {
        result.current.recalculatePadding();
      });

      expect(container.style.paddingBottom).toBe('580px');
      expect(container.scrollTo).not.toHaveBeenCalled();
    });
  });
});
