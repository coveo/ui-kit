import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../utils/xss-utils';

export interface ResultLinkProps {
  href: string;
  target: string;
  part?: string;
  title?: string;
  onSelect: () => void;
  onBeginDelayedSelect: () => void;
  onCancelPendingSelect: () => void;
  ref?: (elm?: HTMLAnchorElement) => void;
}

export const LinkWithResultAnalytics: FunctionalComponent<ResultLinkProps> = (
  {
    href,
    target,
    part,
    title,
    onSelect,
    onBeginDelayedSelect,
    onCancelPendingSelect,
    ref,
  },
  children
) => {
  const stopPropagationAndProcess = (e: Event, process: () => void) => {
    e.stopPropagation();
    process();
  };
  return (
    <a
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
      ref={ref}
    >
      {children}
    </a>
  );
};
