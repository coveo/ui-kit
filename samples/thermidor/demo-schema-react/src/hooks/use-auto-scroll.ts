import {useCallback, useEffect, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';

const MARGIN_TOP = 20;

interface UseAutoScrollOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  turnRefs: React.RefObject<Map<string, HTMLDivElement>>;
  turns: readonly Turn[];
  /** The conversation was restored: its latest turn is aligned at once, not smoothly. */
  restored?: boolean;
}

/** The turn's offset from the top of the container's scrolled content. */
function turnOffset(container: HTMLElement, turn: HTMLElement): number {
  return (
    turn.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  );
}

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

/**
 * Keeps the start of `turn` at the top of `container` while the content changes height, as
 * restored blocks and images do while they render, until the shopper scrolls, presses or types in
 * it. Returns what stops it.
 */
function followTurn(container: HTMLElement, turn: HTMLElement): () => void {
  let stopped = false;
  const align = () => {
    if (!stopped) container.scrollTo({top: turnOffset(container, turn) - MARGIN_TOP});
  };
  const frame = requestAnimationFrame(align);
  const observer = new ResizeObserver(align);
  for (const child of container.children) observer.observe(child);
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    for (const type of USER_SCROLL_EVENTS) container.removeEventListener(type, stop);
  };
  for (const type of USER_SCROLL_EVENTS) container.addEventListener(type, stop);
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
 * - When `restored`, aligns the latest turn at once, and keeps it aligned while the restored
 *   conversation renders
 */
export function useAutoScroll({
  containerRef,
  turnRefs,
  turns,
  restored = false,
}: UseAutoScrollOptions): void {
  const latestTurnId = turns.at(-1)?.id ?? null;
  const jump = useRef(restored);

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

    const atOnce = jump.current;
    jump.current = false;
    const container = containerRef.current;
    let stop: () => void;
    if (atOnce && container && turn) {
      stop = followTurn(container, turn);
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
