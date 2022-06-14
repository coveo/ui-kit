import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../../utils/xss-utils';

export interface ResultLinkProps {
  href: string;
  target: string;
  className?: string;
  part?: string;
  title?: string;
  onSelect: () => void;
  onBeginDelayedSelect: () => void;
  onCancelPendingSelect: () => void;
  ref?: (elm?: HTMLAnchorElement) => void;
  attributes?: Attr[];
  tabIndex?: number;
  ariaHidden?: boolean;
}

export const LinkWithResultAnalytics: FunctionalComponent<ResultLinkProps> = (
  {
    href,
    target,
    className,
    part,
    title,
    onSelect,
    onBeginDelayedSelect,
    onCancelPendingSelect,
    ref,
    attributes,
    tabIndex,
    ariaHidden,
  },
  children
) => {
  const stopPropagationAndProcess = (e: Event, process: () => void) => {
    e.stopPropagation();
    process();
  };
  return (
    <a
      class={className}
      part={part}
      href={filterProtocol(href)}
      title={title}
      onClick={(e) => stopPropagationAndProcess(e, onSelect)}
      onContextMenu={(e) => stopPropagationAndProcess(e, onSelect)}
      onMouseDown={(e) => stopPropagationAndProcess(e, onSelect)}
      onMouseUp={(e) => stopPropagationAndProcess(e, onSelect)}
      onTouchStart={(e) => stopPropagationAndProcess(e, onBeginDelayedSelect)}
      onTouchEnd={(e) => stopPropagationAndProcess(e, onCancelPendingSelect)}
      target={target}
      ref={(el) => {
        if (ref) {
          ref(el);
        }

        if (attributes?.length) {
          [...attributes].forEach(({nodeName, nodeValue}) => {
            el?.setAttribute(nodeName, nodeValue!);
          });
        }

        if (ariaHidden && el) {
          el.setAttribute('aria-hidden', 'true');
        }
      }}
      tabIndex={tabIndex}
    >
      {children}
    </a>
  );
};
