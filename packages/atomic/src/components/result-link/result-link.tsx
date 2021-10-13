import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../utils/xss-utils';
import {InteractiveResult} from '@coveo/headless';

export interface ResultLinkProps {
  interactiveResult: InteractiveResult;
  href: string;
  target: string;
  part: string;
  title?: string;
}

export const LinkWithResultAnalytics: FunctionalComponent<ResultLinkProps> = (
  {href, interactiveResult, target, part, title},
  children
) => (
  <a
    part={part}
    href={filterProtocol(href)}
    title={title}
    onClick={() => interactiveResult.select()}
    onContextMenu={() => interactiveResult.select()}
    onMouseDown={() => interactiveResult.select()}
    onMouseUp={() => interactiveResult.select()}
    onTouchStart={() => interactiveResult.beginDelayedSelect()}
    onTouchEnd={() => interactiveResult.cancelPendingSelect()}
    target={target}
  >
    {children}
  </a>
);
