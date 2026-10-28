import {useCallback, useEffect} from 'react';
import type {Turn} from '@coveo/thermidor';

const MARGIN_TOP = 20;

interface UseAutoScrollOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  turns: readonly Turn[];
}

/** The turn's offset from the top of the container's scrolled content. */
function turnOffset(container: HTMLElement, turn: HTMLElement): number {
  return (
    turn.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  );
}

/**
 * Keeps the turn the shopper started last at the top of the page.
 *
 * - Scrolls the start of a new turn (a prompt, a follow-up chip, or a search option) to the top
 *   of the container
 * - Never follows the answer as it streams: what does not fit stays below the fold
 * - Makes that turn at least as tall as the container, so its start can reach the top and stays
 *   there when its answer shrinks, such as when a placeholder is dropped
 */
export function useAutoScroll({containerRef, turnRefs, turns}: UseAutoScrollOptions): void {
  const latestTurnId = turns.at(-1)?.id ?? null;

  const fitLatestTurn = useCallback(() => {
    const container = containerRef.current;
    const turn = latestTurnId === null ? undefined : turnRefs.current.get(latestTurnId);
    if (!container || !turn) return;

    const paddingBottom = parseFloat(getComputedStyle(container).paddingBottom) || 0;
    const minHeight = Math.max(0, container.clientHeight - paddingBottom - MARGIN_TOP);
    turn.style.minHeight = `${minHeight}px`;
  }, [containerRef, turnRefs, latestTurnId]);

  // Scroll to each new turn as it starts
  useEffect(() => {
    if (latestTurnId === null) return;
    const turn = turnRefs.current.get(latestTurnId);
    fitLatestTurn();

    const frame = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container || !turn) return;
      container.scrollTo({top: turnOffset(container, turn) - MARGIN_TOP, behavior: 'smooth'});
    });
    return () => {
      cancelAnimationFrame(frame);
      if (turn) turn.style.minHeight = '';
    };
  }, [latestTurnId, containerRef, turnRefs, fitLatestTurn]);

  // Refit the latest turn when the container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => fitLatestTurn());
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, fitLatestTurn]);
}
