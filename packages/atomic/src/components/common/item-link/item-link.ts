import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref} from 'lit/directives/ref.js';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {filterProtocol} from '@/src/utils/xss-utils.js';
import {bindAnalyticsToLink} from './bind-analytics-to-link';
export interface ItemLinkProps {
  href: string;
  className?: string;
  part?: string;
  title?: string;
  stopPropagation?: boolean;
  ref?: (elm?: HTMLAnchorElement) => void;
  attributes?: Attr[];
  tabIndex?: number;
  target?: ItemTarget;
  rel?: string;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelect: () => void;
  onBeginDelayedSelect: () => void;
  onCancelPendingSelect: () => void;
  onInitializeLink?: (cleanupCallback: () => void) => void;
}

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
      stopPropagation = true,
      ref: refCallback,
      attributes,
      tabIndex,
      target = '_self',
      rel,
      onMouseOver,
      onMouseLeave,
      onFocus,
      onBlur,
      onSelect,
      onBeginDelayedSelect,
      onCancelPendingSelect,
      onInitializeLink,
    } = props;

    return html`
      <a
        class=${ifDefined(className)}
        part=${ifDefined(part)}
        href=${filterProtocol(href)}
        target=${target}
        title=${ifDefined(title)}
        rel=${ifDefined(rel)}
        ${ref((el) => {
          if (refCallback) {
            refCallback(el as HTMLAnchorElement);
          }

          if (!el) {
            return;
          }

          const cleanup = bindAnalyticsToLink(el as HTMLAnchorElement, {
            onSelect,
            onBeginDelayedSelect,
            onCancelPendingSelect,
            stopPropagation,
          });

          if (onInitializeLink) {
            onInitializeLink(cleanup);
          }

          if (attributes?.length) {
            [...attributes].forEach(({nodeName, nodeValue}) => {
              el.setAttribute(nodeName, nodeValue!);
            });
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
