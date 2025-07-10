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
) => {
  const stopPropagationAndProcess = (e: Event, process: () => void) => {
    stopPropagation && e.stopPropagation();
    process();
  };
  (['click', 'contextmenu', 'mousedown', 'mouseup'] as const).forEach(
    (eventName) =>
      link.addEventListener(eventName, (e) =>
        stopPropagationAndProcess(e, onSelect)
      )
  );
  link.addEventListener(
    'touchstart',
    (e) => stopPropagationAndProcess(e, onBeginDelayedSelect),
    {passive: true}
  );
  link.addEventListener(
    'touchend',
    (e) => stopPropagationAndProcess(e, onCancelPendingSelect),
    {passive: true}
  );
};
