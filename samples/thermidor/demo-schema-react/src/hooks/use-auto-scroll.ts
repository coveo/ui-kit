import {useCallback, useEffect, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';

const MARGIN_TOP = 20;
const END_SETTLED_FRAMES = 10;
const END_MAX_FRAMES = 120;

interface UseAutoScrollOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  turns: readonly Turn[];
  /** Scrolls to the end of the conversation first, as for a restored one, not its latest turn. */
  startAtEnd?: boolean;
}

/** The turn's offset from the top of the container's scrolled content. */
function turnOffset(container: HTMLElement, turn: HTMLElement): number {
  return (
    turn.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  );
}

/**
 * Scrolls `container` to its end on each frame until its height settles, as restored blocks grow
 * while they render, or until the shopper scrolls. Returns what stops it.
 */
function followEnd(container: HTMLElement): () => void {
  let frame = 0;
  let height = -1;
  let settledFrames = 0;
  let frames = 0;
  const step = () => {
    container.scrollTo({top: container.scrollHeight});
    settledFrames = container.scrollHeight === height ? settledFrames + 1 : 0;
    height = container.scrollHeight;
    if (settledFrames < END_SETTLED_FRAMES && ++frames < END_MAX_FRAMES) {
      frame = requestAnimationFrame(step);
    }
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    container.removeEventListener('wheel', stop);
    container.removeEventListener('touchstart', stop);
  };
  container.addEventListener('wheel', stop);
  container.addEventListener('touchstart', stop);
  frame = requestAnimationFrame(step);
  return stop;
}

/**
 * Keeps the turn the shopper started last at the top of the page.
 *
 * - Scrolls the start of a new turn (a prompt, a follow-up chip, or a search option) to the top
 *   of the container
 * - Never follows the answer as it streams: what does not fit stays below the fold
 * - Makes that turn at least as tall as the container, so its start can reach the top and stays
 *   there when its answer shrinks, such as when a placeholder is dropped
 * - With `startAtEnd`, scrolls to the end of the conversation at once on its first turn
 */
export function useAutoScroll({
  containerRef,
  turnRefs,
  turns,
  startAtEnd = false,
}: UseAutoScrollOptions): void {
  const latestTurnId = turns.at(-1)?.id ?? null;
  const atEnd = useRef(startAtEnd);

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

    const toEnd = atEnd.current;
    atEnd.current = false;
    const container = containerRef.current;
    let stop: () => void;
    if (toEnd && container) {
      stop = followEnd(container);
    } else {
      const frame = requestAnimationFrame(() => {
        if (!container || !turn) return;
        container.scrollTo({top: turnOffset(container, turn) - MARGIN_TOP, behavior: 'smooth'});
      });
      stop = () => cancelAnimationFrame(frame);
    }
    return () => {
      stop();
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
