import {type RefObject, useLayoutEffect, useRef} from 'react';
import {scrollToFirstProduct} from './results-focus.js';
import {useActionFailed, useSurfaceLocked} from './session-request.js';

interface PendingChange {
  control: HTMLElement;
  container: Element | null;
}

/**
 * Brings the shopper back to the results once a page change is answered, as the Atomic pager does:
 * the nearest product list scrolls into view and its first product takes focus. Pages differ in
 * height, so without it the control and the cards under the pointer move. Nothing moves when the
 * change failed, or when the shopper moved focus elsewhere on the page while it was answered. The
 * returned callback marks a change as sent; call it from the gesture's optimistic step, which only
 * runs for a gesture the session accepts.
 */
export function usePageChangeFocus(
  control: RefObject<HTMLElement | null>,
  component: string,
  action: string
): () => void {
  const pending = useRef<PendingChange | null>(null);
  const locked = useSurfaceLocked();
  const actionFailed = useActionFailed();

  useLayoutEffect(() => {
    const change = pending.current;
    if (!change || locked) {
      return;
    }
    pending.current = null;
    if (actionFailed(component, action)) {
      return;
    }
    const focused = document.activeElement;
    if (focused && focused !== document.body && !change.control.contains(focused)) {
      return;
    }
    scrollToFirstProduct(change.container);
  }, [locked, actionFailed, component, action]);

  return () => {
    const current = control.current;
    if (current) {
      // The control itself can unmount once answered: a larger page size can leave a single page.
      pending.current = {control: current, container: current.parentElement};
    }
  };
}
