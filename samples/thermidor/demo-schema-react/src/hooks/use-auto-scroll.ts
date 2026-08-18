import {useCallback, useEffect, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';

const MARGIN_TOP = 20;

interface UseAutoScrollOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  turnRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  turns: Turn[];
  isStreaming: boolean;
}

/**
 * Automatically manages scroll position and bottom padding during conversation streaming.
 *
 * - Scrolls to the latest turn when new turns arrive
 * - Clears excess padding when streaming ends
 * - Recalculates padding on container resize
 */
export function useAutoScroll({
  containerRef,
  turnRefs,
  turns,
  isStreaming,
}: UseAutoScrollOptions): void {
  const lastScrolledTurnIdRef = useRef<string | null>(null);
  const prevTurnCountRef = useRef<number>(0);
  const hasMountedRef = useRef(false);
  const prevStreamingRef = useRef(isStreaming);

  const recalculatePadding = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const lastTurnId = lastScrolledTurnIdRef.current;
    if (!lastTurnId) return;

    const targetElement = turnRefs.current.get(lastTurnId);
    if (!targetElement) return;

    const containerHeight = container.clientHeight;
    const bubbleHeight = targetElement.offsetHeight;
    const padding = Math.max(0, containerHeight - bubbleHeight - MARGIN_TOP);

    container.style.paddingBottom = `${padding}px`;
  }, [containerRef, turnRefs]);

  const scrollToPrompt = useCallback(
    (turnId: string) => {
      const container = containerRef.current;
      if (!container) return;

      const targetElement = turnRefs.current.get(turnId);
      if (!targetElement) return;

      lastScrolledTurnIdRef.current = turnId;

      const containerHeight = container.clientHeight;
      const bubbleHeight = targetElement.offsetHeight;
      const padding = Math.max(0, containerHeight - bubbleHeight - MARGIN_TOP);

      container.style.paddingBottom = `${padding}px`;

      const elementOffset = targetElement.offsetTop - container.offsetTop;
      container.scrollTo({top: elementOffset - MARGIN_TOP, behavior: 'smooth'});
    },
    [containerRef, turnRefs]
  );

  const clearPadding = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const lastTurnId = lastScrolledTurnIdRef.current;
    if (!lastTurnId) {
      container.style.paddingBottom = '0px';
      return;
    }

    const targetElement = turnRefs.current.get(lastTurnId);
    if (!targetElement) {
      container.style.paddingBottom = '0px';
      lastScrolledTurnIdRef.current = null;
      return;
    }

    const containerHeight = container.clientHeight;
    const contentScrollHeight =
      container.scrollHeight - parseInt(container.style.paddingBottom || '0', 10);
    const elementOffset = targetElement.offsetTop - container.offsetTop;
    const contentBelowPrompt = contentScrollHeight - elementOffset;
    const neededPadding = Math.max(0, containerHeight - contentBelowPrompt);

    container.style.paddingBottom = `${neededPadding}px`;
  }, [containerRef, turnRefs]);

  // Clear padding when streaming ends
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      clearPadding();
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, clearPadding]);

  // Auto-scroll to latest turn when new turns arrive
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (turns.length > 0) {
        const lastTurn = turns[turns.length - 1];
        requestAnimationFrame(() => scrollToPrompt(lastTurn.id));
      }
      prevTurnCountRef.current = turns.length;
      return;
    }

    if (turns.length > prevTurnCountRef.current) {
      const lastTurn = turns[turns.length - 1];
      requestAnimationFrame(() => scrollToPrompt(lastTurn.id));
    }

    prevTurnCountRef.current = turns.length;
  }, [turns, scrollToPrompt]);

  // Recalculate padding on container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => recalculatePadding());
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, recalculatePadding]);
}
