import {useCallback, useEffect, useRef} from 'react';

const MARGIN_TOP = 20;

interface UseScrollAnchorOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  turnRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

interface UseScrollAnchorReturn {
  scrollToPrompt: (turnId: string) => void;
  recalculatePadding: () => void;
  clearPadding: () => void;
}

export function useScrollAnchor({
  containerRef,
  turnRefs,
}: UseScrollAnchorOptions): UseScrollAnchorReturn {
  const lastScrolledTurnIdRef = useRef<string | null>(null);

  const recalculatePadding = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const lastTurnId = lastScrolledTurnIdRef.current;
    if (!lastTurnId) {
      return;
    }

    const targetElement = turnRefs.current.get(lastTurnId);
    if (!targetElement) {
      return;
    }

    const containerHeight = container.clientHeight;
    const bubbleHeight = targetElement.offsetHeight;
    const padding = Math.max(0, containerHeight - bubbleHeight - MARGIN_TOP);

    container.style.paddingBottom = `${padding}px`;
  }, [containerRef, turnRefs]);

  const scrollToPrompt = useCallback(
    (turnId: string) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const targetElement = turnRefs.current.get(turnId);
      if (!targetElement) {
        return;
      }

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
    if (!container) {
      return;
    }

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      recalculatePadding();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, recalculatePadding]);

  return {scrollToPrompt, recalculatePadding, clearPadding};
}
