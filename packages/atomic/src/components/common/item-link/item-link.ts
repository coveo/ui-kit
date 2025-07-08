import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref} from 'lit/directives/ref.js';
import {filterProtocol} from '../../../utils/xss-utils.js';
import {ItemTarget} from '../layout/display-options.js';

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

export const renderLinkWithItemAnalytics: FunctionalComponentWithChildren<
  ItemLinkProps
> =
  ({props}) =>
  (children) => {
    const {
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
      ref: refCallback,
      attributes,
      tabIndex,
      ariaHidden,
      rel,
      stopPropagation = true,
      target = '_self',
    } = props;

    return html`
      <a
        class=${className ?? ''}
        part=${part ?? ''}
        href=${filterProtocol(href)}
        target=${target}
        title=${title ?? ''}
        rel=${rel ?? ''}
        ${ref((el) => {
          if (refCallback) {
            refCallback(el as HTMLAnchorElement);
          }

          if (!el) {
            return;
          }

          bindAnalyticsToLink(el as HTMLAnchorElement, {
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
        })}
        tabindex=${ifDefined(tabIndex)}
        @mouseover=${onMouseOver}
        @mouseleave=${onMouseLeave}
        @focus=${onFocus}
        @blur=${onBlur}
      >
        ${children}
      </a>
    `;
  };
