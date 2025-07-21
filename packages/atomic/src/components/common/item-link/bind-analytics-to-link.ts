import type {ItemLinkProps} from './item-link';

type ItemLinkEventProps = Pick<
  ItemLinkProps,
  | 'onSelect'
  | 'onBeginDelayedSelect'
  | 'onCancelPendingSelect'
  | 'stopPropagation'
>;

export const bindAnalyticsToLink = (
  link: HTMLAnchorElement,
  {
    onSelect,
    onBeginDelayedSelect,
    onCancelPendingSelect,
    stopPropagation = true,
  }: ItemLinkEventProps
): (() => void) => {
  const stopPropagationAndProcess = (e: Event, process: () => void) => {
    stopPropagation && e.stopPropagation();
    process();
  };

  const selectHandler = (e: Event) => stopPropagationAndProcess(e, onSelect);
  const touchStartHandler = (e: Event) =>
    stopPropagationAndProcess(e, onBeginDelayedSelect);
  const touchEndHandler = (e: Event) =>
    stopPropagationAndProcess(e, onCancelPendingSelect);

  (['click', 'contextmenu', 'mousedown', 'mouseup'] as const).forEach(
    (eventName) => link.addEventListener(eventName, selectHandler)
  );
  link.addEventListener('touchstart', touchStartHandler, {passive: true});
  link.addEventListener('touchend', touchEndHandler, {passive: true});

  return () => {
    (['click', 'contextmenu', 'mousedown', 'mouseup'] as const).forEach(
      (eventName) => link.removeEventListener(eventName, selectHandler)
    );
    link.removeEventListener('touchstart', touchStartHandler);
    link.removeEventListener('touchend', touchEndHandler);
  };
};
