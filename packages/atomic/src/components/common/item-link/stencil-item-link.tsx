import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../../utils/xss-utils';
import {ItemTarget} from '../layout/display-options';
import { bindAnalyticsToLink } from './bind-analytics-to-link';

interface ItemLinkEventProps {
  onSelect: () => void;
  onBeginDelayedSelect: () => void;
  onCancelPendingSelect: () => void;
  stopPropagation?: boolean;
}

interface ItemLinkProps extends ItemLinkEventProps {
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

/**
 * @deprecated should only be used for Stencil components.
 */
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
