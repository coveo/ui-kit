import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../../utils/xss-utils';
import {ItemTarget} from '../layout/display-options';

interface ItemLinkEventProps {
  onSelect: () => void;
  onBeginDelayedSelect: () => void;
  onCancelPendingSelect: () => void;
  stopPropagation?: boolean;
}

export interface ItemLinkProps extends ItemLinkEventProps {
  href: string;
  className?: string;
  part?: string;
  title?: string;
  ref?: (elm?: HTMLAnchorElement) => void;
  stopPropagation?: boolean;
  attributes?: Attr[];
  tabIndex?: number;
  ariaHidden?: boolean;
  target?: ItemTarget;
  rel?: string;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

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

export const LinkWithItemAnalytics: FunctionalComponent<ItemLinkProps> = (
  {
    href,
    className,
    part,
    title,
    onSelect,
    onBeginDelayedSelect,
    onCancelPendingSelect,
    onMouseOver,
    onMouseLeave,
    onFocus,
    onBlur,
    ref,
    attributes,
    tabIndex,
    ariaHidden,
    rel,
    stopPropagation = true,
    target = '_self',
  },
  children
) => {
  return (
    <a
      class={className}
      part={part}
      href={filterProtocol(href)}
      target={target}
      title={title}
      rel={rel}
      ref={(el) => {
        if (ref) {
          ref(el);
        }

        if (!el) {
          return;
        }

        bindAnalyticsToLink(el, {
          onSelect,
          onBeginDelayedSelect,
          onCancelPendingSelect,
          stopPropagation,
        });

        if (attributes?.length) {
          [...attributes].forEach(({nodeName, nodeValue}) => {
            el.setAttribute(nodeName, nodeValue!);
          });
        }

        if (ariaHidden) {
          el.setAttribute('aria-hidden', 'true');
        }
      }}
      tabIndex={tabIndex}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </a>
  );
};
