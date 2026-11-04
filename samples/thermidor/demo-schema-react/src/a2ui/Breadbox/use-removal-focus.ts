import {type RefObject, useLayoutEffect, useRef} from 'react';
import {focusNearestResults} from '../results-focus.js';
import {useSurfaceLocked} from '../session-request.js';

interface PendingRemoval {
  index: number;
  container: Element | null;
}

/**
 * Keeps keyboard focus when a removal unmounts the focused button, as the Atomic breadbox does:
 * focus moves to the button now at the removed one's position (the next value, or the clear-all
 * button), or to the results once the breadbox is empty. Focus elsewhere on the page is left alone,
 * including focus the shopper moves while the removal is answered. It waits for the surface to
 * unlock: a locked surface's buttons are disabled and can't take focus.
 */
export function useRemovalFocus(
  section: RefObject<HTMLElement | null>,
  renderedValues: unknown
): (index: number) => void {
  const pending = useRef<PendingRemoval | null>(null);
  const locked = useSurfaceLocked();

  useLayoutEffect(() => {
    const removal = pending.current;
    if (!removal || locked) {
      return;
    }
    pending.current = null;
    const focused = document.activeElement;
    if (focused && focused !== document.body && !section.current?.contains(focused)) {
      return;
    }
    const buttons = section.current?.querySelectorAll('button');
    if (buttons?.length) {
      buttons[Math.min(removal.index, buttons.length - 1)].focus();
    } else {
      focusNearestResults(removal.container);
    }
  }, [renderedValues, locked, section]);

  return (index: number) => {
    const current = section.current;
    if (current?.contains(document.activeElement)) {
      pending.current = {index, container: current.parentElement};
    }
  };
}
