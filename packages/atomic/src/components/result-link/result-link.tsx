import {FunctionalComponent, h} from '@stencil/core';
import {filterProtocol} from '../../utils/xss-utils';
import {InteractiveResult, Result} from '@coveo/headless';

export interface ResultLinkProps {
  interactiveResult: InteractiveResult;
  result: Result;
  target: string;
  part: string;
}

export const ResultLink: FunctionalComponent<ResultLinkProps> = (
  {result, interactiveResult, target, part},
  children
) => (
  <a
    part={part}
    href={filterProtocol(result.clickUri)}
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
