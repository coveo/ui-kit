import {type RefObject, useLayoutEffect, useRef} from 'react';
import {focusNearestResults} from './results-focus.js';
import {useSurfaceLocked} from './session-request.js';

interface PendingRemoval {
  index: number;
  container: Element | null;
}

/**
 * Keeps keyboard focus when an action unmounts the focused button in `section`, as the Atomic
 * breadbox does: focus moves to the button now at the removed one's position (in the breadbox, the
 * next value or the clear-all button), or to the results once `section` has no buttons left, or is
 * gone. A button that is still rendered gets focus back. Focus elsewhere on the page is left alone,
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
