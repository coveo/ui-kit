import {useLayoutEffect, useRef} from 'react';

/**
 * Publishes the sticky chrome's height (the use-case player over the top bar) as `--chrome-height`
 * on the document, so content that sticks under it, such as the chat panel, starts below it.
 */
export function useChromeHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty('--chrome-height', `${element.getBoundingClientRect().height}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--chrome-height');
    };
  }, []);
  return ref;
}
