import {type RefObject, useLayoutEffect, useRef} from 'react';
import {focusNearestResults} from '../results-focus.js';

interface PendingRemoval {
  index: number;
  container: Element | null;
}

/**
 * Keeps keyboard focus when a removal unmounts the focused button, as the Atomic breadbox does:
 * focus moves to the button now at the removed one's position (the next value, or the clear-all
 * button), or to the results once the breadbox is empty. Focus elsewhere on the page is left alone.
 */
export function useRemovalFocus(
  section: RefObject<HTMLElement | null>,
  renderedValues: unknown
): (index: number) => void {
  const pending = useRef<PendingRemoval | null>(null);

  useLayoutEffect(() => {
    const removal = pending.current;
    if (!removal) {
      return;
    }
    pending.current = null;
    const buttons = section.current?.querySelectorAll('button');
    if (buttons?.length) {
      buttons[Math.min(removal.index, buttons.length - 1)].focus();
    } else {
      focusNearestResults(removal.container);
    }
  }, [renderedValues, section]);

  return (index: number) => {
    const current = section.current;
    if (current?.contains(document.activeElement)) {
      pending.current = {index, container: current.parentElement};
    }
  };
}
